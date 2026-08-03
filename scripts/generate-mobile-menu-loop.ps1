param(
    [string]$Source = "public/backgrounds/mobile-menu-celestial-water-v2.png",
    [string]$OutputStem = "public/backgrounds/mobile-menu-celestial-water-v2-filament-loop-v2",
    [int]$DurationSeconds = 10,
    [int]$FramesPerSecond = 15
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$animationSource = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public static class FilamentFlowRenderer
{
    private const double Tau = Math.PI * 2.0;

    public static void Render(string sourcePath, string frameDirectory, int frameCount)
    {
        using (var loaded = new Bitmap(sourcePath))
        using (var source = new Bitmap(loaded.Width, loaded.Height, PixelFormat.Format24bppRgb))
        {
            using (var normalize = Graphics.FromImage(source))
            {
                normalize.DrawImageUnscaled(loaded, 0, 0);
            }

            int width = source.Width;
            int height = source.Height;
            int horizonY = (int)(height * 0.885);
            var sourceRect = new Rectangle(0, 0, width, height);
            var sourceData = source.LockBits(sourceRect, ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
            int stride = sourceData.Stride;
            byte[] sourcePixels = new byte[stride * height];
            Marshal.Copy(sourceData.Scan0, sourcePixels, 0, sourcePixels.Length);
            source.UnlockBits(sourceData);

            byte[] filamentMask = BuildFilamentMask(sourcePixels, width, height, stride, horizonY);
            byte[] softMask = DilateMask(filamentMask, width, height);

            for (int frameIndex = 0; frameIndex < frameCount; frameIndex++)
            {
                double progress = frameIndex / (double)frameCount;
                byte[] outputPixels = (byte[])sourcePixels.Clone();
                ApplyFilamentFlow(outputPixels, filamentMask, softMask, width, height, stride, horizonY, progress);

                using (var frame = new Bitmap(width, height, PixelFormat.Format24bppRgb))
                {
                    var frameData = frame.LockBits(sourceRect, ImageLockMode.WriteOnly, PixelFormat.Format24bppRgb);
                    Marshal.Copy(outputPixels, 0, frameData.Scan0, outputPixels.Length);
                    frame.UnlockBits(frameData);

                    using (var graphics = Graphics.FromImage(frame))
                    {
                        graphics.CompositingMode = CompositingMode.SourceOver;
                        graphics.CompositingQuality = CompositingQuality.HighQuality;
                        graphics.SmoothingMode = SmoothingMode.AntiAlias;
                        DrawQuietHorizonBreath(graphics, width, height, horizonY, progress);
                        DrawWaterShimmer(graphics, width, height, horizonY, progress);
                    }

                    string framePath = Path.Combine(frameDirectory, string.Format("frame-{0:D4}.png", frameIndex));
                    frame.Save(framePath, ImageFormat.Png);
                }
            }
        }
    }

    private static byte[] BuildFilamentMask(byte[] pixels, int width, int height, int stride, int horizonY)
    {
        var mask = new byte[width * height];
        int skyLimit = Math.Min(horizonY - 20, (int)(height * 0.865));

        for (int y = 2; y < skyLimit; y++)
        {
            double horizonFade = 1.0;
            double fadeStart = height * 0.78;
            if (y > fadeStart)
            {
                horizonFade = Math.Max(0.0, 1.0 - ((y - fadeStart) / (skyLimit - fadeStart)));
            }

            for (int x = 5; x < width - 5; x++)
            {
                int offset = (y * stride) + (x * 3);
                int blue = pixels[offset];
                int green = pixels[offset + 1];
                int red = pixels[offset + 2];
                double luminance = (red * 0.28) + (green * 0.50) + (blue * 0.22);
                double cyanBias = ((green + blue) * 0.5) - (red * 0.90);

                int leftOffset = (y * stride) + ((x - 4) * 3);
                int rightOffset = (y * stride) + ((x + 4) * 3);
                double leftLuminance = (pixels[leftOffset + 2] * 0.28) + (pixels[leftOffset + 1] * 0.50) + (pixels[leftOffset] * 0.22);
                double rightLuminance = (pixels[rightOffset + 2] * 0.28) + (pixels[rightOffset + 1] * 0.50) + (pixels[rightOffset] * 0.22);
                double ridge = luminance - ((leftLuminance + rightLuminance) * 0.5);

                if (cyanBias < 2.5 || ridge < 0.30 || luminance < 8.0)
                {
                    continue;
                }

                double score = ((ridge - 0.30) * 4.4) + ((cyanBias - 2.5) * 0.58) + (Math.Max(0.0, luminance - 18.0) * 0.18);
                int value = (int)Math.Round(Math.Max(0.0, Math.Min(128.0, score * horizonFade)));
                mask[(y * width) + x] = (byte)value;
            }
        }

        return mask;
    }

    private static byte[] DilateMask(byte[] mask, int width, int height)
    {
        var dilated = new byte[mask.Length];
        for (int y = 2; y < height - 2; y++)
        {
            int row = y * width;
            for (int x = 3; x < width - 3; x++)
            {
                int index = row + x;
                int value = mask[index];
                for (int offsetY = -2; offsetY <= 2; offsetY++)
                {
                    for (int offsetX = -3; offsetX <= 3; offsetX++)
                    {
                        int distance = Math.Abs(offsetX) + Math.Abs(offsetY);
                        if (distance == 0 || distance > 4) continue;
                        int neighbor = mask[index + (offsetY * width) + offsetX];
                        int softened = (int)Math.Round(neighbor / (1.0 + (distance * 0.72)));
                        value = Math.Max(value, softened);
                    }
                }
                dilated[index] = (byte)value;
            }
        }
        return dilated;
    }

    private static void ApplyFilamentFlow(
        byte[] output,
        byte[] filamentMask,
        byte[] softMask,
        int width,
        int height,
        int stride,
        int horizonY,
        double progress)
    {
        int skyLimit = Math.Min(horizonY - 20, (int)(height * 0.865));

        for (int y = 1; y < skyLimit; y++)
        {
            for (int x = 1; x < width - 1; x++)
            {
                int maskIndex = (y * width) + x;
                int core = filamentMask[maskIndex];
                int softness = softMask[maskIndex];
                if (core == 0 && softness == 0)
                {
                    continue;
                }

                int band = x / 22;
                double seedA = Hash01(band, 17);
                double seedB = Hash01(band, 43);
                double seedC = Hash01(band, 89);
                double wavelength = 245.0 + (seedA * 185.0);
                int travelCycles = seedB > 0.72 ? 2 : 1;
                double direction = seedC > 0.34 ? 1.0 : -1.0;

                double organicWobble =
                    0.085 * Math.Sin(Tau * progress + (seedB * Tau) + (y * 0.0021)) +
                    0.032 * Math.Sin((Tau * 2.0 * progress) + (seedC * Tau) - (y * 0.0013));

                double primaryAngle = Tau * ((y / wavelength) + (direction * travelCycles * progress) + seedA + organicWobble);
                double primary = Math.Pow(0.5 + (0.5 * Math.Cos(primaryAngle)), 4.0);

                double secondaryAngle = Tau * ((y / (wavelength * 1.72)) - (direction * progress) + seedB - (organicWobble * 0.55));
                double secondary = Math.Pow(0.5 + (0.5 * Math.Cos(secondaryAngle)), 7.0);

                double restEnvelope = 0.62 + (0.38 * (0.5 + (0.5 * Math.Sin(Tau * progress + (seedC * Tau)))));
                double activity = ((primary * 0.74) + (secondary * 0.26)) * restEnvelope;
                double energy = (core * (activity - 0.22) * 1.55) + (softness * activity * 0.72);
                if (Math.Abs(energy) < 0.45)
                {
                    continue;
                }

                int pixelOffset = (y * stride) + (x * 3);
                output[pixelOffset] = AddClamped(output[pixelOffset], energy * 1.24);
                output[pixelOffset + 1] = AddClamped(output[pixelOffset + 1], energy * 1.02);
                output[pixelOffset + 2] = AddClamped(output[pixelOffset + 2], energy * 0.36);
            }
        }
    }

    private static void DrawQuietHorizonBreath(Graphics graphics, int width, int height, int horizonY, double progress)
    {
        double breath = 0.5 + (0.5 * Math.Sin(Tau * progress - (Math.PI / 2.0)));
        for (int offset = -48; offset <= 22; offset += 3)
        {
            double falloff = Math.Exp(-Math.Pow(offset / 34.0, 2.0));
            int alpha = (int)Math.Round((3.0 + (4.0 * breath)) * falloff);
            if (alpha < 1) continue;
            using (var pen = new Pen(Color.FromArgb(alpha, 170, 225, 238), 3.0f))
            {
                graphics.DrawLine(pen, 0, horizonY + offset, width, horizonY + offset);
            }
        }
    }

    private static void DrawWaterShimmer(Graphics graphics, int width, int height, int horizonY, double progress)
    {
        double phase = Tau * progress;
        for (int ripple = 0; ripple < 4; ripple++)
        {
            int pointCount = (width / 10) + 3;
            var points = new PointF[pointCount];
            double baseY = horizonY + 30 + (ripple * 37);
            double amplitude = 0.8 + (ripple * 0.38);
            double wavelength = 155.0 + (ripple * 41.0);
            for (int index = 0; index < pointCount; index++)
            {
                float x = (index * 10.0f) - 10.0f;
                float y = (float)(baseY + (amplitude * Math.Sin(((x / wavelength) * Tau) + phase + (ripple * 0.81))));
                points[index] = new PointF(x, y);
            }

            int alpha = 4 + (int)Math.Round(3.0 * (0.5 + (0.5 * Math.Sin(phase + (ripple * 1.17)))));
            using (var pen = new Pen(Color.FromArgb(alpha, 138, 220, 238), 1.0f))
            {
                graphics.DrawLines(pen, points);
            }
        }
    }

    private static byte AddClamped(byte current, double addition)
    {
        return (byte)Math.Max(0, Math.Min(255, current + (int)Math.Round(addition)));
    }

    private static double Hash01(int value, int salt)
    {
        unchecked
        {
            uint hash = (uint)(value * 374761393 + salt * 668265263);
            hash = (hash ^ (hash >> 13)) * 1274126177u;
            hash ^= hash >> 16;
            return (hash & 0x00FFFFFFu) / 16777215.0;
        }
    }
}
'@

$drawingAssembly = [System.Drawing.Graphics].Assembly.Location
$drawingPrimitivesAssembly = Join-Path $PSHOME "System.Drawing.Primitives.dll"
$gdiAssembly = Join-Path $PSHOME "System.Private.Windows.GdiPlus.dll"
$windowsCoreAssembly = Join-Path $PSHOME "System.Private.Windows.Core.dll"
Add-Type -TypeDefinition $animationSource -Language CSharp -ReferencedAssemblies $drawingAssembly,$drawingPrimitivesAssembly,$gdiAssembly,$windowsCoreAssembly

$workspace = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$sourcePath = [System.IO.Path]::GetFullPath((Join-Path $workspace $Source))
$outputBase = [System.IO.Path]::GetFullPath((Join-Path $workspace $OutputStem))
$frameDirectory = Join-Path $workspace "tmp/mobile-menu-celestial-water-v2-filament-loop-frames"

if (-not (Test-Path -LiteralPath $sourcePath)) {
    throw "Source image not found: $sourcePath"
}

if (Test-Path -LiteralPath $frameDirectory) {
    $resolvedFrames = (Resolve-Path -LiteralPath $frameDirectory).Path
    $resolvedTmp = [System.IO.Path]::GetFullPath((Join-Path $workspace "tmp"))
    if (-not $resolvedFrames.StartsWith($resolvedTmp, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to clear frame directory outside workspace tmp: $resolvedFrames"
    }
    Remove-Item -LiteralPath $resolvedFrames -Recurse -Force
}

New-Item -ItemType Directory -Path $frameDirectory -Force | Out-Null
New-Item -ItemType Directory -Path ([System.IO.Path]::GetDirectoryName($outputBase)) -Force | Out-Null

$frameCount = $DurationSeconds * $FramesPerSecond
[FilamentFlowRenderer]::Render($sourcePath, $frameDirectory, $frameCount)

$inputPattern = Join-Path $frameDirectory "frame-%04d.png"
$webmPath = "$outputBase.webm"
$gifPath = "$outputBase.gif"

& ffmpeg -hide_banner -loglevel error -y `
    -framerate $FramesPerSecond -i $inputPattern `
    -an -c:v libvpx-vp9 -crf 29 -b:v 0 -deadline good -cpu-used 2 -row-mt 1 -g $FramesPerSecond `
    -vf "scale=940:1672:flags=lanczos,format=yuv420p" `
    $webmPath
if ($LASTEXITCODE -ne 0) {
    throw "WebM export failed with exit code $LASTEXITCODE"
}

& ffmpeg -hide_banner -loglevel error -y `
    -framerate $FramesPerSecond -i $inputPattern `
    -filter_complex "fps=10,scale=470:836:flags=lanczos,split[gif_a][gif_b];[gif_a]palettegen=max_colors=128:stats_mode=diff[palette];[gif_b][palette]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" `
    -loop 0 $gifPath
if ($LASTEXITCODE -ne 0) {
    throw "GIF export failed with exit code $LASTEXITCODE"
}

$resolvedFrames = (Resolve-Path -LiteralPath $frameDirectory).Path
$resolvedTmp = [System.IO.Path]::GetFullPath((Join-Path $workspace "tmp"))
if (-not $resolvedFrames.StartsWith($resolvedTmp, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to clear frame directory outside workspace tmp: $resolvedFrames"
}
Remove-Item -LiteralPath $resolvedFrames -Recurse -Force

Get-Item -LiteralPath $webmPath, $gifPath | Select-Object FullName, Length, LastWriteTime
