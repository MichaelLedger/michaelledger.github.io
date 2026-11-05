# EXIF lookup: main image, thumbnail, and orientation

This guide accompanies `exif_lookup.py`. Both inspect metadata without modifying the source image. Examples use macOS Terminal and assume the files are in `~/Documents/EXIF-Lookup/`. Replace `/path/to/photo.jpg` with your image path, or drag an image from Finder into Terminal to insert its path.

## 1. Setup and quick start

The script needs Python 3 and ExifTool. ExifTool was already installed on this Mac at `/opt/homebrew/bin/exiftool` when this guide was created.

```sh
python3 --version
exiftool -ver

# Only if ExifTool is missing, and Homebrew is installed:
brew install exiftool
```

Read all recognized metadata:

```sh
python3 ~/Documents/EXIF-Lookup/exif_lookup.py "/path/to/photo.jpg"
```

Read the main image and thumbnail separately:

```sh
python3 ~/Documents/EXIF-Lookup/exif_lookup.py --group ifd0 "/path/to/photo.jpg"
python3 ~/Documents/EXIF-Lookup/exif_lookup.py --group ifd1 "/path/to/photo.jpg"
```

Show raw numeric values, including orientation codes:

```sh
python3 ~/Documents/EXIF-Lookup/exif_lookup.py --numeric "/path/to/photo.jpg"
```

Save a JSON report, compare multiple files, or include unknown tags:

```sh
python3 ~/Documents/EXIF-Lookup/exif_lookup.py --json "/path/to/photo.jpg" > ~/Desktop/photo-exif.json
python3 ~/Documents/EXIF-Lookup/exif_lookup.py "/path/to/first.jpg" "/path/to/second.jpg"
python3 ~/Documents/EXIF-Lookup/exif_lookup.py --unknown "/path/to/photo.jpg"
python3 ~/Documents/EXIF-Lookup/exif_lookup.py --help
```

The `>` operator creates or replaces the report file; it does not change the image. Use a new report filename when preserving an earlier report.

### Automatic IFD1 thumbnail pixel dimensions

The script now also reads the embedded JPEG referenced by IFD1. Your usual lookup command prints these additional lines for the supplied photo:

```text
[IFD1Thumbnail] PixelWidth                      : 160
[IFD1Thumbnail] PixelHeight                     : 120
```

`IFD1Thumbnail` is a derived output group added by this script, not an actual EXIF directory. These values come from the embedded JPEG header; they are not stored `IFD1:ImageWidth` or `IFD1:ImageHeight` tags. They describe stored thumbnail pixels before applying its orientation. The script extracts and inspects the thumbnail in memory and creates no temporary image files.

This runs for the default lookup, `--group ifd1`, and `--group exif`. JSON output includes `IFD1Thumbnail:PixelWidth` and `IFD1Thumbnail:PixelHeight`. Files without an IFD1 thumbnail show `IFD1Thumbnail:Status` instead. An unreadable thumbnail is reported as `IFD1Thumbnail:Error`, with a nonzero exit status.

### Script options

| Option | Meaning |
|---|---|
| `images` | One or more image paths; quote paths containing spaces. |
| `--group all` | Default: all recognized metadata, including file information and computed values. |
| `--group ifd0` | Main-image EXIF directory only. Does not include its nested camera/exposure directory. |
| `--group ifd1` | Embedded-thumbnail directory only, if present. |
| `--group exif` | EXIF family, including its directories and maker metadata as ExifTool classifies them. |
| `--group sony` | Sony maker tags, if present. |
| `--numeric` | Disable friendly value conversion; e.g. `6` instead of `Rotate 90 CW`. |
| `--json` | JSON output; group-qualified keys distinguish `IFD0:Orientation` from `IFD1:Orientation`. |
| `--unknown` | Include unrecognized tag IDs. Opaque binary data does not imply an editor or editing history. |
| `--help` | Show usage. |

## 2. Direct ExifTool commands: getting IFD0 and IFD1

The Python script is a convenience wrapper. These commands work directly:

```sh
# Main-image directory:
exiftool -a -G1 -s -IFD0:all "/path/to/photo.jpg"

# Thumbnail directory:
exiftool -a -G1 -s -IFD1:all "/path/to/photo.jpg"

# Both orientation values, as numbers:
exiftool -a -G1 -s -n -IFD0:Orientation -IFD1:Orientation "/path/to/photo.jpg"

# Stored pixel dimensions plus both orientations:
exiftool -a -G1 -s -n -File:ImageWidth -File:ImageHeight \
  -IFD0:Orientation -IFD1:Orientation "/path/to/photo.jpg"

# All EXIF directories, with duplicate names retained:
exiftool -a -G1 -s -EXIF:all "/path/to/photo.jpg"

# Editor identifiers and common editing-history containers:
exiftool -a -G1 -s -Software -ProcessingSoftware -CreatorTool \
  -XMP:all -Photoshop:all "/path/to/photo.jpg"

# Extract the embedded thumbnail, if present, to a separate new file:
exiftool -b -ThumbnailImage "/path/to/photo.jpg" > ~/Desktop/photo-thumbnail.jpg

# Inspect the extracted thumbnail's actual dimensions:
exiftool -G1 -s -ImageWidth -ImageHeight ~/Desktop/photo-thumbnail.jpg
```

If no thumbnail exists, extraction can produce an empty file. The extracted JPEG may have no EXIF of its own: its orientation can reside in the parent photo's IFD1 directory.

### ExifTool command parameters

| Parameter | Meaning |
|---|---|
| `-a` | Allow duplicate tag names to be displayed. Essential when comparing orientation in different directories. |
| `-G1` | Show family-1 group names, such as `[IFD0]`, `[IFD1]`, and `[ExifIFD]`. The `1` is a group-family selector, not an image number. |
| `-s` | Show short technical tag names, such as `DateTimeOriginal`. |
| `-n` | Disable print conversion: show stored codes/values rather than human-friendly labels. Some decoding still occurs; this is not a raw byte dump. |
| `-j` | Output JSON. Combine with `-G1` to distinguish same-named tags in different groups. |
| `-u` | Include unknown tags. |
| `-b` | Output binary tag contents, used here to extract `ThumbnailImage`. |
| `-IFD0:all` | Select every available tag in the main-image directory. |
| `-IFD1:all` | Select every available tag in the thumbnail directory. |
| `-EXIF:all` | Select the EXIF metadata family. |
| `-Sony:all` | Select Sony maker metadata. |
| `-IFD0:Orientation` | Select one specific tag from one specific directory. |
| `-XMP:all` / `-Photoshop:all` | Select those metadata families/containers, if present. |
| `-ver` | Print installed ExifTool version. |
| `>` | Shell output redirection, not an ExifTool option. Creates or replaces the destination file. |
| `\` at end of line | Continue a shell command on the next line. No spaces should follow it. |

No tag assignments such as `-Orientation=1` are used here. The commands above only read the input images.

## 3. Why one photo can have two orientation tags

IFD means **Image File Directory**. A JPEG can contain an EXIF APP1 segment whose TIFF-style structure includes several directories:

```text
JPEG
└── EXIF APP1 segment
    ├── IFD0: main-image information, including main-image Orientation
    │   ├── ExifIFD: camera, exposure, capture time, color information
    │   │   ├── MakerNotes: camera-vendor information, such as Sony
    │   │   └── InteropIFD: interoperability information
    │   └── GPS IFD: coordinates/time, if present
    └── IFD1: thumbnail information, including thumbnail Orientation
        └── Embedded thumbnail JPEG bytes
```

This is a conceptual map of the common EXIF structure; not every image contains every directory. **IFD0 and IFD1 are not two editing histories or proof of two editors.** Their same-named tags refer to different images.

### Findings for the first supplied photo

| Item | Verified value |
|---|---|
| EXIF APP1 segments | One |
| Main JPEG stored width × height | 2048 × 1536 pixels |
| `IFD0:Orientation` | 6 — rotate 90° clockwise |
| Main display width × height after orientation | 1536 × 2048 pixels — portrait |
| Embedded thumbnail width × height | 160 × 120 pixels |
| `IFD1:Orientation` | 1 — normal |
| Main and thumbnail camera | SONY DSC-W215 |
| Main and thumbnail modification timestamp | 2017:02:11 03:50:12 |
| EXIF inside extracted thumbnail JPEG | None found |
| Software, ProcessingSoftware, CreatorTool, XMP, Photoshop metadata | None found by ExifTool |

Expected orientation command output for that file:

```text
[IFD0]          Orientation                     : 6
[IFD1]          Orientation                     : 1
```

The two orientation values apply to their respective images. To determine whether the thumbnail's visible content matches the oriented main image, extract it and inspect it; dimension/tag differences alone do not establish whether its content was rotated correctly.

Absence of software/history tags means **no editor history was identified in retained metadata**. It cannot prove the photo was never edited, or count how many editors touched it. Editors may preserve, replace, or remove metadata.

## 4. Orientation codes and dimensions

Orientation describes the transformation needed to display stored pixels correctly. It does not require the stored JPEG width and height to be portrait.

| Code | Transformation to display stored pixels | Swap width and height? |
|---|---|---|
| 1 | Normal | No |
| 2 | Mirror horizontally | No |
| 3 | Rotate 180° | No |
| 4 | Mirror vertically | No |
| 5 | Transpose: reflect across the top-left to bottom-right diagonal | Yes |
| 6 | Rotate 90° clockwise | Yes |
| 7 | Transverse: reflect across the top-right to bottom-left diagonal | Yes |
| 8 | Rotate 90° counterclockwise | Yes |

For codes 5–8, display width = stored height and display height = stored width. For codes 1–4, dimensions stay in the same order. A missing orientation tag means no orientation instruction was found; it does not establish the original camera pose.

For application debugging, check whether the image loader already applies EXIF orientation before adding a saved editor rotation. Also confirm whether thumbnail/full-size dimensions and crop offsets are measured before or after orientation. The earlier page JSON's `edit.rotate` is application editing state, not an EXIF tag; its meaning requires checking the app's rendering code.

`ExposureProgram: Landscape` and `SceneCaptureType: Landscape` describe a **camera scene mode**, not whether the image should display horizontally.

## 5. Tag dictionary for this photo

ExifTool combines actual EXIF, camera maker metadata, JPEG properties, filesystem information, and computed values. The group label tells you where each value came from. Not every item printed by ExifTool is EXIF.

### Main-image, exposure, and color tags

| Tag | Meaning and this photo's value |
|---|---|
| `ImageDescription` | Optional text description; blank here. |
| `Make` / `Model` | Camera manufacturer/model: SONY / DSC-W215. Can appear in both IFD0 and IFD1. |
| `Orientation` | Display transformation; main 6, thumbnail 1. See code table. |
| `XResolution` / `YResolution` | Suggested horizontal/vertical print density: 72/72. These do not determine pixel dimensions or detail. |
| `ResolutionUnit` | Unit for resolution: inches here, making the values 72 pixels per inch. |
| `ModifyDate` | EXIF modification timestamp: 2017:02:11 03:50:12. Named `DateTime` by some libraries; not a reliable edit log. |
| `YCbCrPositioning` | Alignment of chroma samples relative to luminance: co-sited here. |
| `ExposureTime` | Shutter-open duration: 1/80 second. |
| `FNumber` | Aperture f-number: f/2.8. Lower numbers indicate a larger aperture relative to focal length. |
| `ExposureProgram` | Camera program used: code 8, Landscape. Does not specify image orientation. |
| `ISO` | Exposure sensitivity setting: 125. Some libraries call it `ISOSpeedRatings`. |
| `ExifVersion` | EXIF specification version stored by the camera: 0221 (2.21). |
| `DateTimeOriginal` | Camera-recorded capture time: 2017:02:11 03:50:12. No timezone offset was found. |
| `CreateDate` | EXIF digitization time; same timestamp here. Some libraries call it `DateTimeDigitized`. |
| `ComponentsConfiguration` | Image component layout: Y, Cb, Cr, unused. |
| `CompressedBitsPerPixel` | Camera-recorded compression-related value: 4. Not the uncompressed channel bit depth. |
| `ExposureCompensation` | Exposure adjustment relative to metering: 0 EV. Also called `ExposureBiasValue`. |
| `MaxApertureValue` | Lens maximum aperture encoded in APEX units. Raw value 3 corresponds to about f/2.8; ExifTool converts it for display. |
| `MeteringMode` | Method of measuring exposure: code 5, multi-segment. |
| `LightSource` | Reported illumination type: code 0, unknown. Separate from white-balance mode. |
| `Flash` | Bit field describing firing/mode/return information: raw 16, off and did not fire. |
| `FocalLength` | Actual lens focal length: 5.35 mm. ExifTool's friendly display rounds to 5.3 mm; not a 35 mm equivalent. |
| `FlashpixVersion` | Flashpix format compatibility version: 0100. Not a software version. |
| `ColorSpace` | Color-space designation: code 1, sRGB. |
| `ExifImageWidth` / `ExifImageHeight` | EXIF-recorded main-image pixel dimensions: 2048 × 1536. These may become stale after editing; compare against `[File]` dimensions. |
| `FileSource` | Source type: digital camera. |
| `SceneType` | Scene acquisition type: directly photographed image. |
| `CustomRendered` | Rendering treatment: normal. This is not proof that no subsequent editing occurred. |
| `ExposureMode` | Automatic/manual/bracket exposure category: auto. Sony's same-named maker tag uses a different vendor-specific enumeration. |
| `WhiteBalance` | White-balance control: auto. Does not give an exact color temperature. |
| `SceneCaptureType` | Scene category: code 1, Landscape. Does not specify image orientation. |
| `Contrast` / `Saturation` / `Sharpness` | Camera processing settings: normal for each. |

### Thumbnail, structure, and interoperability tags

| Tag | Meaning |
|---|---|
| `Compression` in IFD1 | How the embedded thumbnail is encoded: JPEG (old-style). The label refers to its TIFF/EXIF encoding convention. |
| `ThumbnailOffset` | Byte offset locating thumbnail data within the EXIF/TIFF structure: 9780. Not a crop offset. |
| `ThumbnailLength` | Thumbnail JPEG data size: 11753 bytes. |
| `ThumbnailImage` | Embedded thumbnail binary data; extract with `-b -ThumbnailImage`. |
| `ExifOffset` | Pointer to the camera/exposure EXIF directory; some tools expose it as a tag. Not image position. |
| `ExifInteroperabilityOffset` | Pointer to the interoperability directory. |
| `InteropIndex` | Interoperability profile: R98, DCF basic file using sRGB. |
| `InteropVersion` | Interoperability version: 0100. |
| `PrintIMVersion` | Print Image Matching metadata version: 0300. Printing-related metadata, not evidence of another editor. |
| `PrintIM_0x0002` / `PrintIM_0x0101` | PrintIM entries whose meanings were not named by this ExifTool output; values 1 and 3. Do not infer an edit history. |

### Sony maker tags present

MakerNotes are vendor-specific camera metadata inside EXIF. They are not a separate editor's EXIF block. Some fields are undocumented or vary by camera.

| Tag | Meaning / observed value |
|---|---|
| `SonyDateTime` | Sony-recorded timestamp: 2017:02:11 03:50:12. |
| `SonyImageWidth` / `SonyImageHeight` | Sony's recorded image dimensions: 2048 × 1536. |
| `FacesDetected` | Camera-reported face count: 0. Separate from the page JSON's `isUsedFaceInfo`. |
| `FaceInfoOffset` / `FaceInfoLength` | Internal face-data location/length fields: 72 / 32. Not crop coordinates. |
| `MetaVersion` | Sony metadata version identifier: DC5303320222000. |
| `CreativeStyle` | Camera image-processing style: Standard. |
| `Macro` | Close-up mode: off. |
| `ExposureMode` in Sony group | Sony scene/program setting: Landscape. Unlike `ExifIFD:ExposureMode`, this is vendor-specific. |
| `FocusMode` | Focus mode: AF-S, single autofocus. |
| `AFAreaMode` | Autofocus area selection: Multi. |
| `AFIlluminator` | Autofocus assist illumination: off. |
| `JPEGQuality` | Camera JPEG quality setting: Standard. |
| `FlashLevel` | Camera flash intensity adjustment: Normal. |
| `ReleaseMode` | Capture/release mode: Normal. |
| `SequenceNumber` | Burst/sequence indication: Single. |
| `Anti-Blur` | Camera anti-blur setting: off. Avoid inferring the exact physical stabilization behavior from this field alone. |
| `DynamicRangeOptimizer` | Sony tonal-processing setting: Standard. |
| `HighISONoiseReduction2` | Sony noise-reduction setting: Normal. |
| `IntelligentAuto` | Sony automatic scene selection feature: off. |
| `Sony_0x…` | Unnamed vendor tag IDs exposed with `--unknown`. Their meaning cannot be established from the hexadecimal identifier alone; large binary values are not readable editor logs. |

### File, filesystem, and computed fields

| Group / tags | Meaning |
|---|---|
| `[File] ImageWidth`, `ImageHeight` | Dimensions read from the JPEG itself: 2048 × 1536. These describe stored pixels before orientation. |
| `[File] FileType`, `FileTypeExtension`, `MIMEType` | JPEG / jpg / image/jpeg. |
| `[File] ExifByteOrder` | Byte ordering used by the EXIF/TIFF data: little-endian. Does not affect portrait/landscape. |
| `[File] EncodingProcess` | JPEG coding method: baseline DCT, Huffman coding. |
| `[File] BitsPerSample` | Precision per color component: 8 bits. |
| `[File] ColorComponents` | Number of color components: 3. |
| `[File] YCbCrSubSampling` | Chroma subsampling: 4:2:2 here; chroma has less horizontal resolution than luminance. |
| `[System] FileName`, `Directory`, `FileSize` | Current file's name, directory, and byte size. Not camera EXIF. |
| `[System] FileModifyDate`, `FileAccessDate`, `FileInodeChangeDate` | Filesystem timestamps. Copying/importing/accessing files can affect them; they are distinct from camera timestamps. Inode change time is not creation time. |
| `[System] FilePermissions` | Current operating-system access permissions. |
| `[ExifTool] ExifToolVersion` | Version of the inspection tool, not software that edited the image. |
| `[Composite] Aperture` | Convenient derived aperture value: f/2.8. |
| `[Composite] ImageSize`, `Megapixels` | Derived stored dimensions and pixel count: 2048 × 1536, about 3.1 MP. |
| `[Composite] ShutterSpeed` | Convenient shutter-speed representation: 1/80 second. |
| `[Composite] FocalLength35efl` | Composite focal-length display. Here it prints 5.3 mm without a 35 mm equivalent; do not assume that number is 35 mm equivalent. |
| `[Composite] LightValue` | Derived exposure/light value from exposure settings: 9.0 here. Not a direct ambient-light sensor reading. |

## 6. Other common EXIF and editor fields

These are useful on other photos. They were not all present in the supplied image.

| Tag(s) | Meaning |
|---|---|
| `Software`, `ProcessingSoftware` | Software identifiers recorded in metadata. May identify a camera firmware or processing tool; do not necessarily identify the last editor. |
| `XMP:CreatorTool` | XMP software/creator-tool identifier. |
| XMP history fields | Optional recorded processing events; can be missing, incomplete, or removed. |
| `OffsetTime`, `OffsetTimeOriginal`, `OffsetTimeDigitized` | Timezone offsets corresponding to modification, capture, and digitization times. |
| `SubSecTime`, `SubSecTimeOriginal`, `SubSecTimeDigitized` | Fractional seconds for their corresponding timestamps. |
| `GPSLatitude`, `GPSLatitudeRef` | Latitude and north/south reference. |
| `GPSLongitude`, `GPSLongitudeRef` | Longitude and east/west reference. |
| `GPSAltitude`, `GPSAltitudeRef` | Altitude and above/below reference level. |
| `GPSDateStamp`, `GPSTimeStamp` | GPS date/time, conventionally UTC. Separate from camera-local capture time. |
| `GPSImgDirection`, `GPSImgDirectionRef` | Image direction/bearing and true/magnetic north reference. |
| `LensMake`, `LensModel`, `LensInfo` | Lens maker/model and lens range specifications. |
| `FocalLengthIn35mmFormat` | Focal length expressed as a 35 mm full-frame equivalent. Distinct from actual focal length. |
| `BodySerialNumber`, `LensSerialNumber` | Camera/lens serial identifiers, when retained. |
| `Artist`, `Copyright`, `UserComment` | Optional attribution, rights, or comment text. |
| `ImageUniqueID` | Image identifier recorded by a device/tool; not a cryptographic authenticity guarantee. |
| `ShutterSpeedValue` | Shutter speed in APEX form; friendly tools may convert it to seconds. |
| `ApertureValue` | Aperture in APEX form; friendly tools may convert it to an f-number. |
| `BrightnessValue` | Camera-reported scene brightness in APEX units. |
| `SubjectDistance` | Camera-reported subject distance, if available. |
| `DigitalZoomRatio` | Recorded digital zoom ratio. |

There is no finite universal list of all image metadata: EXIF versions, XMP namespaces, file formats, and manufacturers add different tags. This guide covers the named fields in the supplied photo and common fields useful for later checks. For the installed ExifTool's complete tag-name list and local documentation:

```sh
exiftool -list
exiftool -listg1
man exiftool
```

`-list` lists known tag names; `-listg1` lists family-1 group names. Neither command inspects a photo. Unknown proprietary tags should remain unknown unless supported by camera-specific documentation.

## exif_lookup.py

```
#!/usr/bin/env python3
"""Read image metadata with ExifTool; never modify source images."""

import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys


def thumbnail_dimensions(tool, path):
    """Read dimensions from the JPEG referenced by IFD1, without creating files."""
    extracted = subprocess.run(
        [tool, "-b", "-IFD1:ThumbnailImage", str(path)], capture_output=True,
    )
    if extracted.returncode:
        raise RuntimeError(extracted.stderr.decode("utf-8", errors="replace").strip())
    if not extracted.stdout:
        return {"IFD1Thumbnail:Status": "No embedded IFD1 thumbnail"}
    inspected = subprocess.run(
        [tool, "-j", "-n", "-File:ImageWidth", "-File:ImageHeight", "-"],
        input=extracted.stdout, capture_output=True,
    )
    if inspected.returncode:
        raise RuntimeError(inspected.stderr.decode("utf-8", errors="replace").strip())
    tags = json.loads(inspected.stdout)[0]
    if "ImageWidth" not in tags or "ImageHeight" not in tags:
        raise RuntimeError("Embedded thumbnail dimensions could not be read")
    return {
        "IFD1Thumbnail:PixelWidth": tags["ImageWidth"],
        "IFD1Thumbnail:PixelHeight": tags["ImageHeight"],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("images", nargs="+", type=Path, help="Image file(s) to inspect")
    parser.add_argument(
        "--group", choices=("all", "ifd0", "ifd1", "exif", "sony"), default="all",
        help="Metadata group: all (default), main image, thumbnail, EXIF, or Sony",
    )
    parser.add_argument("--numeric", action="store_true", help="Show numeric codes instead of friendly labels")
    parser.add_argument("--json", action="store_true", help="Output JSON instead of text")
    parser.add_argument("--unknown", action="store_true", help="Include unknown tags (may contain opaque maker data)")
    args = parser.parse_args()

    tool = shutil.which("exiftool")
    if not tool:
        for candidate in ("/opt/homebrew/bin/exiftool", "/usr/local/bin/exiftool"):
            if os.path.isfile(candidate) and os.access(candidate, os.X_OK):
                tool = candidate
                break
    if not tool:
        parser.exit(2, "ExifTool not found. Install with: brew install exiftool\n")

    paths = [p.expanduser().resolve() for p in args.images]
    for path in paths:
        if not path.is_file():
            parser.error(f"Image file not found: {path}")

    command = [tool, "-a", "-G1", "-s"]
    if args.numeric:
        command.append("-n")
    if args.json:
        command.append("-j")
    if args.unknown:
        command.append("-u")
    groups = {"ifd0": "-IFD0:all", "ifd1": "-IFD1:all", "exif": "-EXIF:all", "sony": "-Sony:all"}
    if args.group != "all":
        command.append(groups[args.group])
    # Absolute paths avoid treating dash-prefixed filenames as ExifTool options.
    try:
        json_rows = []
        status = 0
        for path in paths:
            result = subprocess.run(command + [str(path)], capture_output=True)
            if result.stderr:
                sys.stderr.write(result.stderr.decode("utf-8", errors="replace"))
            status = max(status, result.returncode)
            extra = {}
            if not result.returncode and args.group in ("all", "ifd1", "exif"):
                try:
                    extra = thumbnail_dimensions(tool, path)
                except (RuntimeError, ValueError, KeyError) as error:
                    extra = {"IFD1Thumbnail:Error": str(error)}
                    status = max(status, 1)
            if args.json:
                rows = json.loads(result.stdout) if result.stdout.strip() else []
                for row in rows:
                    row.update(extra)
                json_rows.extend(rows)
            else:
                if len(paths) > 1:
                    print(f"======== {path}")
                print(result.stdout.decode("utf-8", errors="replace"), end="")
                for key, value in extra.items():
                    group, tag = key.split(":", 1)
                    print(f"[{group}] {tag:<31} : {value}")
        if args.json:
            print(json.dumps(json_rows, ensure_ascii=False, indent=2))
        return status
    except (OSError, ValueError) as error:
        parser.exit(2, f"Could not inspect image metadata: {error}\n")


if __name__ == "__main__":
    sys.exit(main())
```

## sample
```
➜  EXIF-Lookup python3 exif_lookup.py cb9346aa-868b-4def-b591-8f0243576ff8.jpeg
[ExifTool]      ExifToolVersion                 : 13.55
[System]        FileName                        : cb9346aa-868b-4def-b591-8f0243576ff8.jpeg
[System]        Directory                       : /Users/gavinxiang/Documents/EXIF-Lookup
[System]        FileSize                        : 1386 kB
[System]        FileModifyDate                  : 2026:11:04 07:41:12+08:00
[System]        FileAccessDate                  : 2026:11:05 16:28:05+08:00
[System]        FileInodeChangeDate             : 2026:11:05 16:27:57+08:00
[System]        FilePermissions                 : -rw-rw-r--
[File]          FileType                        : JPEG
[File]          FileTypeExtension               : jpg
[File]          MIMEType                        : image/jpeg
[File]          ExifByteOrder                   : Little-endian (Intel, II)
[File]          ImageWidth                      : 2048
[File]          ImageHeight                     : 1536
[File]          EncodingProcess                 : Baseline DCT, Huffman coding
[File]          BitsPerSample                   : 8
[File]          ColorComponents                 : 3
[File]          YCbCrSubSampling                : YCbCr4:2:2 (2 1)
[IFD0]          ImageDescription                : 
[IFD0]          Make                            : SONY
[IFD0]          Model                           : DSC-W215
[IFD0]          Orientation                     : Rotate 90 CW
[IFD0]          XResolution                     : 72
[IFD0]          YResolution                     : 72
[IFD0]          ResolutionUnit                  : inches
[IFD0]          ModifyDate                      : 2017:02:11 03:50:12
[IFD0]          YCbCrPositioning                : Co-sited
[ExifIFD]       ExposureTime                    : 1/80
[ExifIFD]       FNumber                         : 2.8
[ExifIFD]       ExposureProgram                 : Landscape
[ExifIFD]       ISO                             : 125
[ExifIFD]       ExifVersion                     : 0221
[ExifIFD]       DateTimeOriginal                : 2017:02:11 03:50:12
[ExifIFD]       CreateDate                      : 2017:02:11 03:50:12
[ExifIFD]       ComponentsConfiguration         : Y, Cb, Cr, -
[ExifIFD]       CompressedBitsPerPixel          : 4
[ExifIFD]       ExposureCompensation            : 0
[ExifIFD]       MaxApertureValue                : 2.8
[ExifIFD]       MeteringMode                    : Multi-segment
[ExifIFD]       LightSource                     : Unknown
[ExifIFD]       Flash                           : Off, Did not fire
[ExifIFD]       FocalLength                     : 5.3 mm
[ExifIFD]       FlashpixVersion                 : 0100
[ExifIFD]       ColorSpace                      : sRGB
[ExifIFD]       ExifImageWidth                  : 2048
[ExifIFD]       ExifImageHeight                 : 1536
[ExifIFD]       FileSource                      : Digital Camera
[ExifIFD]       SceneType                       : Directly photographed
[ExifIFD]       CustomRendered                  : Normal
[ExifIFD]       ExposureMode                    : Auto
[ExifIFD]       WhiteBalance                    : Auto
[ExifIFD]       SceneCaptureType                : Landscape
[ExifIFD]       Contrast                        : Normal
[ExifIFD]       Saturation                      : Normal
[ExifIFD]       Sharpness                       : Normal
[Sony]          FaceInfoOffset                  : 72
[Sony]          SonyDateTime                    : 2017:02:11 03:50:12
[Sony]          SonyImageHeight                 : 1536
[Sony]          SonyImageWidth                  : 2048
[Sony]          FacesDetected                   : 0
[Sony]          FaceInfoLength                  : 32
[Sony]          MetaVersion                     : DC5303320222000
[Sony]          CreativeStyle                   : Standard
[Sony]          Macro                           : Off
[Sony]          ExposureMode                    : Landscape
[Sony]          FocusMode                       : AF-S
[Sony]          AFAreaMode                      : Multi
[Sony]          AFIlluminator                   : Off
[Sony]          JPEGQuality                     : Standard
[Sony]          FlashLevel                      : Normal
[Sony]          ReleaseMode                     : Normal
[Sony]          SequenceNumber                  : Single
[Sony]          Anti-Blur                       : Off
[Sony]          DynamicRangeOptimizer           : Standard
[Sony]          HighISONoiseReduction2          : Normal
[Sony]          IntelligentAuto                 : Off
[InteropIFD]    InteropIndex                    : R98 - DCF basic file (sRGB)
[InteropIFD]    InteropVersion                  : 0100
[PrintIM]       PrintIMVersion                  : 0300
[IFD1]          Compression                     : JPEG (old-style)
[IFD1]          Make                            : SONY
[IFD1]          Model                           : DSC-W215
[IFD1]          Orientation                     : Horizontal (normal)
[IFD1]          XResolution                     : 72
[IFD1]          YResolution                     : 72
[IFD1]          ResolutionUnit                  : inches
[IFD1]          ModifyDate                      : 2017:02:11 03:50:12
[IFD1]          ThumbnailOffset                 : 9780
[IFD1]          ThumbnailLength                 : 11753
[IFD1]          ThumbnailImage                  : (Binary data 11753 bytes, use -b option to extract)
[Composite]     Aperture                        : 2.8
[Composite]     ImageSize                       : 2048x1536
[Composite]     Megapixels                      : 3.1
[Composite]     ShutterSpeed                    : 1/80
[Composite]     FocalLength35efl                : 5.3 mm
[Composite]     LightValue                      : 9.0
➜  EXIF-Lookup python3 exif_lookup.py cb9346aa-868b-4def-b591-8f0243576ff8.jpeg
[ExifTool]      ExifToolVersion                 : 13.55
[System]        FileName                        : cb9346aa-868b-4def-b591-8f0243576ff8.jpeg
[System]        Directory                       : /Users/gavinxiang/Documents/EXIF-Lookup
[System]        FileSize                        : 1386 kB
[System]        FileModifyDate                  : 2026:11:04 07:41:12+08:00
[System]        FileAccessDate                  : 2026:11:05 16:28:05+08:00
[System]        FileInodeChangeDate             : 2026:11:05 16:27:57+08:00
[System]        FilePermissions                 : -rw-rw-r--
[File]          FileType                        : JPEG
[File]          FileTypeExtension               : jpg
[File]          MIMEType                        : image/jpeg
[File]          ExifByteOrder                   : Little-endian (Intel, II)
[File]          ImageWidth                      : 2048
[File]          ImageHeight                     : 1536
[File]          EncodingProcess                 : Baseline DCT, Huffman coding
[File]          BitsPerSample                   : 8
[File]          ColorComponents                 : 3
[File]          YCbCrSubSampling                : YCbCr4:2:2 (2 1)
[IFD0]          ImageDescription                : 
[IFD0]          Make                            : SONY
[IFD0]          Model                           : DSC-W215
[IFD0]          Orientation                     : Rotate 90 CW
[IFD0]          XResolution                     : 72
[IFD0]          YResolution                     : 72
[IFD0]          ResolutionUnit                  : inches
[IFD0]          ModifyDate                      : 2017:02:11 03:50:12
[IFD0]          YCbCrPositioning                : Co-sited
[ExifIFD]       ExposureTime                    : 1/80
[ExifIFD]       FNumber                         : 2.8
[ExifIFD]       ExposureProgram                 : Landscape
[ExifIFD]       ISO                             : 125
[ExifIFD]       ExifVersion                     : 0221
[ExifIFD]       DateTimeOriginal                : 2017:02:11 03:50:12
[ExifIFD]       CreateDate                      : 2017:02:11 03:50:12
[ExifIFD]       ComponentsConfiguration         : Y, Cb, Cr, -
[ExifIFD]       CompressedBitsPerPixel          : 4
[ExifIFD]       ExposureCompensation            : 0
[ExifIFD]       MaxApertureValue                : 2.8
[ExifIFD]       MeteringMode                    : Multi-segment
[ExifIFD]       LightSource                     : Unknown
[ExifIFD]       Flash                           : Off, Did not fire
[ExifIFD]       FocalLength                     : 5.3 mm
[ExifIFD]       FlashpixVersion                 : 0100
[ExifIFD]       ColorSpace                      : sRGB
[ExifIFD]       ExifImageWidth                  : 2048
[ExifIFD]       ExifImageHeight                 : 1536
[ExifIFD]       FileSource                      : Digital Camera
[ExifIFD]       SceneType                       : Directly photographed
[ExifIFD]       CustomRendered                  : Normal
[ExifIFD]       ExposureMode                    : Auto
[ExifIFD]       WhiteBalance                    : Auto
[ExifIFD]       SceneCaptureType                : Landscape
[ExifIFD]       Contrast                        : Normal
[ExifIFD]       Saturation                      : Normal
[ExifIFD]       Sharpness                       : Normal
[Sony]          FaceInfoOffset                  : 72
[Sony]          SonyDateTime                    : 2017:02:11 03:50:12
[Sony]          SonyImageHeight                 : 1536
[Sony]          SonyImageWidth                  : 2048
[Sony]          FacesDetected                   : 0
[Sony]          FaceInfoLength                  : 32
[Sony]          MetaVersion                     : DC5303320222000
[Sony]          CreativeStyle                   : Standard
[Sony]          Macro                           : Off
[Sony]          ExposureMode                    : Landscape
[Sony]          FocusMode                       : AF-S
[Sony]          AFAreaMode                      : Multi
[Sony]          AFIlluminator                   : Off
[Sony]          JPEGQuality                     : Standard
[Sony]          FlashLevel                      : Normal
[Sony]          ReleaseMode                     : Normal
[Sony]          SequenceNumber                  : Single
[Sony]          Anti-Blur                       : Off
[Sony]          DynamicRangeOptimizer           : Standard
[Sony]          HighISONoiseReduction2          : Normal
[Sony]          IntelligentAuto                 : Off
[InteropIFD]    InteropIndex                    : R98 - DCF basic file (sRGB)
[InteropIFD]    InteropVersion                  : 0100
[PrintIM]       PrintIMVersion                  : 0300
[IFD1]          Compression                     : JPEG (old-style)
[IFD1]          Make                            : SONY
[IFD1]          Model                           : DSC-W215
[IFD1]          Orientation                     : Horizontal (normal)
[IFD1]          XResolution                     : 72
[IFD1]          YResolution                     : 72
[IFD1]          ResolutionUnit                  : inches
[IFD1]          ModifyDate                      : 2017:02:11 03:50:12
[IFD1]          ThumbnailOffset                 : 9780
[IFD1]          ThumbnailLength                 : 11753
[IFD1]          ThumbnailImage                  : (Binary data 11753 bytes, use -b option to extract)
[Composite]     Aperture                        : 2.8
[Composite]     ImageSize                       : 2048x1536
[Composite]     Megapixels                      : 3.1
[Composite]     ShutterSpeed                    : 1/80
[Composite]     FocalLength35efl                : 5.3 mm
[Composite]     LightValue                      : 9.0
[IFD1Thumbnail] PixelWidth                      : 160
[IFD1Thumbnail] PixelHeight                     : 120
```
