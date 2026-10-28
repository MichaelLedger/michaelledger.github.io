# HEIC EXIF and rotation report

Inspected: 2026-10-28 (Asia/Shanghai) using ExifTool 13.55.

Source: `/Users/gavinxiang/Desktop/1aee753d-aba4-42b3-aced-42f80d92327b 2.heic`

## Rotation findings

```text
[IFD0]          Orientation                     : Rotate 270 CW
[QuickTime]     Rotation                        : Rotate 270 CW
[QuickTime]     Rotation                        : Horizontal (normal)
[File]          ImageWidth                      : 5712
[File]          ImageHeight                     : 4284
```

| Field | Value | Meaning |
| --- | --- | --- |
| EXIF / IFD0 Orientation | Rotate 270 CW | Rotate 270° clockwise, equivalent to 90° counterclockwise, to orient the associated pixels. |
| HEIC / QuickTime Rotation, first occurrence | Rotate 270 CW | A container image rotation instruction. |
| HEIC / QuickTime Rotation, second occurrence | Horizontal (normal) | Another image rotation property has no rotation. |
| File ImageWidth × ImageHeight | 5712 × 4284 | The image dimensions reported by ExifTool, before interpreting the orientation above. |
| Dimensions after a quarter-turn | 4284 × 5712 | Portrait dimensions when the 270° rotation applies to the 5712 × 4284 image. |

Numeric values reported by ExifTool:

```text
[IFD0]          Orientation                     : 8
[QuickTime]     Rotation                        : 1
[QuickTime]     Rotation                        : 0
```

EXIF Orientation is an enumeration, not a degree value: value 8 means Rotate 270 CW. HEIC Rotation is a separate container property; do not treat its numeric value as an EXIF orientation code.

### Why the iPhone displays it upright

The iPhone's image viewer interprets the HEIC image structure and display transforms, so an orientation instruction is applied automatically. A rotation tag does not mean that the photo should look sideways to the user; it describes how stored image data is presented upright.

An app that ignores an applicable transform, or rotates pixels that its decoder has already oriented, can display the photo sideways. The exact cause in another app requires examining that app's decoding and rendering behavior.

### Multiple image items matter

This HEIC contains multiple images and auxiliary data, including an HDR gain map, semantic mattes, portrait effects matte, and a thumbnail. ExifTool also reports a 4284 × 5712 image spatial extent and PrimaryItemReference = 46.

The grouped tag dump does not establish which rotation property belongs to each image item. Therefore, the two QuickTime Rotation entries alone do not prove conflicting metadata. The earlier explanation of landscape pixels plus a rotation is a useful interpretation of the EXIF fields, but it is not a complete mapping of this HEIC's primary display image. These rotation fields should not be blindly added together.

## Main capture metadata

| Property | Reported value |
| --- | --- |
| File type / size | HEIC / approximately 7.6 MB |
| Camera | Apple iPhone 17 Pro Max |
| Camera software | 26.6.2 |
| Capture time | 2026-10-04 10:52:38.408 −07:00 |
| Resolution | 5712 × 4284, approximately 24.5 MP |
| Exposure | 1/1855 s, f/1.8, ISO 80 |
| Focal length | 6.8 mm; 24 mm equivalent |
| Lens | iPhone 17 Pro Max back triple camera 6.765mm f/1.78 |
| Flash | Off, did not fire |
| White balance | Auto |
| Color profile | Display P3; additional profiles exist for other image data |
| GPS latitude | 34° 0′ 16.26″ N |
| GPS longitude | 118° 1′ 8.72″ W |
| GPS altitude | Approximately 267.5 m above sea level |

The capture time retains the file's recorded −07:00 offset. It has not been converted to the report's timezone.

## Terminal commands

Read all exposed metadata, preserving duplicate fields and showing group names:

```bash
exiftool -a -G1 -s '/Users/gavinxiang/Desktop/1aee753d-aba4-42b3-aced-42f80d92327b 2.heic'
```

Read rotation and dimensions:

```bash
exiftool -a -G1 -s -Orientation -Rotation -ImageWidth -ImageHeight '/Users/gavinxiang/Desktop/1aee753d-aba4-42b3-aced-42f80d92327b 2.heic'
```

Read numeric orientation and rotation values:

```bash
exiftool -a -G1 -s -n -Orientation -Rotation '/Users/gavinxiang/Desktop/1aee753d-aba4-42b3-aced-42f80d92327b 2.heic'
```

These commands only read metadata. The source image was not modified.

Reference: [ExifTool QuickTime / HEIC tag documentation](https://exiftool.org/TagNames/QuickTime.html).

## Full metadata dump

This includes EXIF, HEIC container fields, Apple maker notes, GPS, color profiles, and ExifTool-derived Composite fields. Binary payloads are represented by ExifTool's descriptions rather than extracted.

```text
[ExifTool]      ExifToolVersion                 : 13.55
[System]        FileName                        : 1aee753d-aba4-42b3-aced-42f80d92327b 2.heic
[System]        Directory                       : /Users/gavinxiang/Desktop
[System]        FileSize                        : 7.6 MB
[System]        FileModifyDate                  : 2026:10:28 02:59:40+08:00
[System]        FileAccessDate                  : 2026:10:28 11:08:46+08:00
[System]        FileInodeChangeDate             : 2026:10:28 11:05:14+08:00
[System]        FilePermissions                 : -rw-rw-r--
[File]          FileType                        : HEIC
[File]          FileTypeExtension               : heic
[File]          MIMEType                        : image/heic
[File]          ExifByteOrder                   : Big-endian (Motorola, MM)
[File]          ImageWidth                      : 5712
[File]          ImageHeight                     : 4284
[QuickTime]     MajorBrand                      : High Efficiency Image Format HEVC still image (.HEIC)
[QuickTime]     MinorVersion                    : 0.0.0
[QuickTime]     CompatibleBrands                : mif1, MiHB, MiHA, heix, MiHE, MiPr, miaf, heic, tmap
[QuickTime]     HandlerType                     : Picture
[QuickTime]     ImageSpatialExtent              : 640x896
[QuickTime]     ImageSpatialExtent              : 5712x4284
[QuickTime]     Rotation                        : Rotate 270 CW
[QuickTime]     ImagePixelDepth                 : 8 8 8
[QuickTime]     ImageSpatialExtent              : 2856x2142
[QuickTime]     ImagePixelDepth                 : 8
[QuickTime]     AuxiliaryImageType              : urn:com:apple:photo:2020:aux:hdrgainmap
[QuickTime]     ImageSpatialExtent              : 2016x1512
[QuickTime]     AuxiliaryImageType              : urn:com:apple:photo:2020:aux:semanticskymatte
[QuickTime]     AuxiliaryImageType              : urn:com:apple:photo:2019:aux:semanticskinmatte
[QuickTime]     ImageSpatialExtent              : 416x312
[QuickTime]     ImageSpatialExtent              : 512x512
[QuickTime]     ImageSpatialExtent              : 4096x3072
[QuickTime]     ImagePixelDepth                 : 10 10 10
[QuickTime]     AuxiliaryImageType              : tag:apple.com,2023:photo:aux:styledeltamap
[QuickTime]     AuxiliaryImageType              : urn:com:apple:photo:2018:aux:portraiteffectsmatte
[QuickTime]     ImageSpatialExtent              : 1024x768
[QuickTime]     AuxiliaryImageType              : tag:apple.com,2023:photo:aux:linearthumbnail
[QuickTime]     ColorProfiles                   : nclx
[QuickTime]     ColorPrimaries                  : Unspecified
[QuickTime]     TransferCharacteristics         : Unspecified
[QuickTime]     MatrixCoefficients              : Unspecified
[QuickTime]     VideoFullRangeFlag              : Full
[QuickTime]     ImageSpatialExtent              : 4284x5712
[QuickTime]     Rotation                        : Horizontal (normal)
[QuickTime]     HEVCConfigurationVersion        : 1
[QuickTime]     GeneralProfileSpace             : Conforming
[QuickTime]     GeneralTierFlag                 : Main Tier
[QuickTime]     GeneralProfileIDC               : Main Still Picture
[QuickTime]     GenProfileCompatibilityFlags    : Main Still Picture, Main 10, Main
[QuickTime]     ConstraintIndicatorFlags        : 176 0 0 0 0 0
[QuickTime]     GeneralLevelIDC                 : 63 (level 2.1)
[QuickTime]     MinSpatialSegmentationIDC       : 0
[QuickTime]     ParallelismType                 : 0
[QuickTime]     ChromaFormat                    : 4:2:0
[QuickTime]     BitDepthLuma                    : 8
[QuickTime]     BitDepthChroma                  : 8
[QuickTime]     AverageFrameRate                : 0
[QuickTime]     ConstantFrameRate               : Unknown
[QuickTime]     NumTemporalLayers               : 1
[QuickTime]     TemporalIDNested                : No
[QuickTime]     HEVCConfigurationVersion        : 1
[QuickTime]     GeneralProfileSpace             : Conforming
[QuickTime]     GeneralTierFlag                 : Main Tier
[QuickTime]     GeneralProfileIDC               : Format Range Extensions
[QuickTime]     GenProfileCompatibilityFlags    : Format Range Extensions
[QuickTime]     ConstraintIndicatorFlags        : 191 200 0 0 0 0
[QuickTime]     GeneralLevelIDC                 : 93 (level 3.1)
[QuickTime]     MinSpatialSegmentationIDC       : 0
[QuickTime]     ParallelismType                 : 0
[QuickTime]     ChromaFormat                    : Monochrome
[QuickTime]     BitDepthLuma                    : 8
[QuickTime]     BitDepthChroma                  : 8
[QuickTime]     AverageFrameRate                : 0
[QuickTime]     ConstantFrameRate               : Unknown
[QuickTime]     NumTemporalLayers               : 1
[QuickTime]     TemporalIDNested                : No
[QuickTime]     HEVCConfigurationVersion        : 1
[QuickTime]     GeneralProfileSpace             : Conforming
[QuickTime]     GeneralTierFlag                 : Main Tier
[QuickTime]     GeneralProfileIDC               : Format Range Extensions
[QuickTime]     GenProfileCompatibilityFlags    : Format Range Extensions
[QuickTime]     ConstraintIndicatorFlags        : 191 200 0 0 0 0
[QuickTime]     GeneralLevelIDC                 : 150 (level 5.0)
[QuickTime]     MinSpatialSegmentationIDC       : 0
[QuickTime]     ParallelismType                 : 0
[QuickTime]     ChromaFormat                    : Monochrome
[QuickTime]     BitDepthLuma                    : 8
[QuickTime]     BitDepthChroma                  : 8
[QuickTime]     AverageFrameRate                : 0
[QuickTime]     ConstantFrameRate               : Unknown
[QuickTime]     NumTemporalLayers               : 1
[QuickTime]     TemporalIDNested                : No
[QuickTime]     HEVCConfigurationVersion        : 1
[QuickTime]     GeneralProfileSpace             : Conforming
[QuickTime]     GeneralTierFlag                 : Main Tier
[QuickTime]     GeneralProfileIDC               : Main Still Picture
[QuickTime]     GenProfileCompatibilityFlags    : Main Still Picture, Main 10, Main
[QuickTime]     ConstraintIndicatorFlags        : 176 0 0 0 0 0
[QuickTime]     GeneralLevelIDC                 : 93 (level 3.1)
[QuickTime]     MinSpatialSegmentationIDC       : 0
[QuickTime]     ParallelismType                 : 0
[QuickTime]     ChromaFormat                    : 4:2:0
[QuickTime]     BitDepthLuma                    : 8
[QuickTime]     BitDepthChroma                  : 8
[QuickTime]     AverageFrameRate                : 0
[QuickTime]     ConstantFrameRate               : Unknown
[QuickTime]     NumTemporalLayers               : 1
[QuickTime]     TemporalIDNested                : No
[QuickTime]     HEVCConfigurationVersion        : 1
[QuickTime]     GeneralProfileSpace             : Conforming
[QuickTime]     GeneralTierFlag                 : Main Tier
[QuickTime]     GeneralProfileIDC               : Main 10
[QuickTime]     GenProfileCompatibilityFlags    : Main 10
[QuickTime]     ConstraintIndicatorFlags        : 176 0 0 0 0 0
[QuickTime]     GeneralLevelIDC                 : 90 (level 3.0)
[QuickTime]     MinSpatialSegmentationIDC       : 0
[QuickTime]     ParallelismType                 : 0
[QuickTime]     ChromaFormat                    : 4:2:0
[QuickTime]     BitDepthLuma                    : 10
[QuickTime]     BitDepthChroma                  : 10
[QuickTime]     AverageFrameRate                : 0
[QuickTime]     ConstantFrameRate               : Unknown
[QuickTime]     NumTemporalLayers               : 1
[QuickTime]     TemporalIDNested                : No
[QuickTime]     HEVCConfigurationVersion        : 1
[QuickTime]     GeneralProfileSpace             : Conforming
[QuickTime]     GeneralTierFlag                 : Main Tier
[QuickTime]     GeneralProfileIDC               : Main 10
[QuickTime]     GenProfileCompatibilityFlags    : Main 10
[QuickTime]     ConstraintIndicatorFlags        : 176 0 0 0 0 0
[QuickTime]     GeneralLevelIDC                 : 93 (level 3.1)
[QuickTime]     MinSpatialSegmentationIDC       : 0
[QuickTime]     ParallelismType                 : 0
[QuickTime]     ChromaFormat                    : 4:2:0
[QuickTime]     BitDepthLuma                    : 10
[QuickTime]     BitDepthChroma                  : 10
[QuickTime]     AverageFrameRate                : 0
[QuickTime]     ConstantFrameRate               : Unknown
[QuickTime]     NumTemporalLayers               : 1
[QuickTime]     TemporalIDNested                : No
[QuickTime]     MediaDataSize                   : 7556485
[QuickTime]     MediaDataOffset                 : 35879
[Meta]          PrimaryItemReference            : 46
[Meta]          MetaImageSize                   : 5712x4284 0 516 2856 2142 0 1287 4096 3072 0 0 64 0 0 15 16960 42 15066 15 16960 65524 63287 15 16960 42 15066 15 16960 17 51904 15 16960 0 10 15 16960 0 10 15 16960
[XMP-x]         XMPToolkit                      : XMP Core 6.0.0
[XMP-semanticSegmentationMatte] SemanticSegmentationMatteVersion: 65536
[XMP-semanticSegmentationMatte] SemanticSegmentationMatteVersion: 65536
[XMP-apdi]      AuxiliaryImageSubType           : portraiteffectsmatte
[XMP-apdi]      NativeFormat                    : L008
[XMP-apdi]      AuxiliaryImageType              : depth
[XMP-apdi]      StoredFormat                    : L008
[XMP-portraitEffectsMatte] PortraitEffectsMatteVersion: 65537
[XMP-HDRGainMap] HDRGainMapVersion              : 0.2.0.0
[XMP-HDRGainMap] HDRGainMapHeadroom             : 6.809638
[PLIST]         Tag2                            : False
[PLIST]         TagH                            : 2.37084913253784
[PLIST]         Tag3                            : (Binary data 516 bytes, use -b option to extract)
[PLIST]         IOriginalRangeMin               : -0.0246124267578125
[PLIST]         IOriginalRangeMax               : 1.048828125
[PLIST]         IGain                           : 9.48339653015137
[PLIST]         Tag4                            : 5.692307472229
[PLIST]         TagJ                            : 1
[PLIST]         TagC                            : (Binary data 2048 bytes, use -b option to extract)
[PLIST]         Tag5                            : 2
[PLIST]         TagK                            : True
[PLIST]         TagD                            : (Binary data 2048 bytes, use -b option to extract)
[PLIST]         Tag6ToneMappedImageRedChannelSkinBasedP98: 0.78428316116333
[PLIST]         Tag6ToneMappedImageRedChannelSkinBasedP10: 0.44816181063652
[PLIST]         Tag6ToneMappedImageRedChannelSkinBasedP75: 0.574207305908203
[PLIST]         Tag6ToneMappedImageRedChannelSkinBasedWhitePoint: 0.798288226127625
[PLIST]         Tag6ToneMappedImageRedChannelSkinBasedP25: 0.471503585577011
[PLIST]         Tag6ToneMappedImageRedChannelSkinBasedP02: 0.33612135052681
[PLIST]         Tag6ToneMappedImageRedChannelSkinBasedHighKey: 0.999838411808014
[PLIST]         Tag6ToneMappedImageRedChannelSkinBasedBlackPoint: 0.176304802298546
[PLIST]         Tag6ToneMappedImageRedChannelSkinBasedP50: 0.504182040691376
[PLIST]         Tag6ToneMappedImageGreenChannelSkinBasedP98: 0.378136515617371
[PLIST]         Tag6ToneMappedImageGreenChannelSkinBasedP10: 0.228749260306358
[PLIST]         Tag6ToneMappedImageGreenChannelSkinBasedP75: 0.303442895412445
[PLIST]         Tag6ToneMappedImageGreenChannelSkinBasedWhitePoint: 0.396809935569763
[PLIST]         Tag6ToneMappedImageGreenChannelSkinBasedP25: 0.242754310369492
[PLIST]         Tag6ToneMappedImageGreenChannelSkinBasedP02: 0.168060675263405
[PLIST]         Tag6ToneMappedImageGreenChannelSkinBasedHighKey: 0.99993485212326
[PLIST]         Tag6ToneMappedImageGreenChannelSkinBasedBlackPoint: 0.102392986416817
[PLIST]         Tag6ToneMappedImageGreenChannelSkinBasedP50: 0.256759375333786
[PLIST]         Tag6ToneMappedImageP98          : 0.732931315898895
[PLIST]         Tag6ToneMappedImageP10          : 0.00933670438826084
[PLIST]         Tag6ToneMappedImageP75          : 0.24742266535759
[PLIST]         Tag6ToneMappedImageWhitePoint   : 1.00369572639465
[PLIST]         Tag6ToneMappedImageP25          : 0.0326784662902355
[PLIST]         Tag6ToneMappedImageP02          : 0.00466835219413042
[PLIST]         Tag6ToneMappedImageHighKey      : 0.789483547210693
[PLIST]         Tag6ToneMappedImageBlackPoint   : 0
[PLIST]         Tag6ToneMappedImageP50          : 0.140050560235977
[PLIST]         Tag6ToneMappedImagePersonSegmentBasedP98: 0.732931315898895
[PLIST]         Tag6ToneMappedImagePersonSegmentBasedP10: 0.00466835219413042
[PLIST]         Tag6ToneMappedImagePersonSegmentBasedP75: 0.205407500267029
[PLIST]         Tag6ToneMappedImagePersonSegmentBasedWhitePoint: 0.96168053150177
[PLIST]         Tag6ToneMappedImagePersonSegmentBasedP25: 0.0606885775923729
[PLIST]         Tag6ToneMappedImagePersonSegmentBasedP02: 0.00466835219413042
[PLIST]         Tag6ToneMappedImagePersonSegmentBasedHighKey: 0.799180686473846
[PLIST]         Tag6ToneMappedImagePersonSegmentBasedBlackPoint: 0
[PLIST]         Tag6ToneMappedImagePersonSegmentBasedP50: 0.140050560235977
[PLIST]         Tag6LinearImageSkinBasedP98     : 0.117670834064484
[PLIST]         Tag6LinearImageSkinBasedP10     : 0.0686413198709488
[PLIST]         Tag6LinearImageSkinBasedP75     : 0.0784472227096558
[PLIST]         Tag6LinearImageSkinBasedWhitePoint: 0.127476736903191
[PLIST]         Tag6LinearImageSkinBasedP25     : 0.0686413198709488
[PLIST]         Tag6LinearImageSkinBasedP02     : 0.0490295141935349
[PLIST]         Tag6LinearImageSkinBasedHighKey : 0.99998539686203
[PLIST]         Tag6LinearImageSkinBasedBlackPoint: 0.0356769189238548
[PLIST]         Tag6LinearImageSkinBasedP50     : 0.0686413198709488
[PLIST]         Tag6LinearImageP98              : 0.402042031288147
[PLIST]         Tag6LinearImageP10              : 0.00980590283870697
[PLIST]         Tag6LinearImageP75              : 0.0588354170322418
[PLIST]         Tag6LinearImageWhitePoint       : 2.37302851676941
[PLIST]         Tag6LinearImageP25              : 0.00980590283870697
[PLIST]         Tag6LinearImageP02              : 0.00980590283870697
[PLIST]         Tag6LinearImageHighKey          : 0.925904214382172
[PLIST]         Tag6LinearImageBlackPoint       : 0
[PLIST]         Tag6LinearImageP50              : 0.0392236113548279
[PLIST]         Tag6LinearImagePersonSegmentBasedP98: 0.460877418518066
[PLIST]         Tag6LinearImagePersonSegmentBasedP10: 0.00980590283870697
[PLIST]         Tag6LinearImagePersonSegmentBasedP75: 0.0490295141935349
[PLIST]         Tag6LinearImagePersonSegmentBasedWhitePoint: 1.07864928245544
[PLIST]         Tag6LinearImagePersonSegmentBasedP25: 0.0196118056774139
[PLIST]         Tag6LinearImagePersonSegmentBasedP02: 0.00980590283870697
[PLIST]         Tag6LinearImagePersonSegmentBasedHighKey: 0.940451622009277
[PLIST]         Tag6LinearImagePersonSegmentBasedBlackPoint: 0
[PLIST]         Tag6LinearImagePersonSegmentBasedP50: 0.0294177085161209
[PLIST]         Tag6ToneMappedImageBlueChannelSkinBasedP98: 0.200739145278931
[PLIST]         Tag6ToneMappedImageBlueChannelSkinBasedP10: 0.0886986926198006
[PLIST]         Tag6ToneMappedImageBlueChannelSkinBasedP75: 0.15872398018837
[PLIST]         Tag6ToneMappedImageBlueChannelSkinBasedWhitePoint: 0.22408090531826
[PLIST]         Tag6ToneMappedImageBlueChannelSkinBasedP25: 0.116708807647228
[PLIST]         Tag6ToneMappedImageBlueChannelSkinBasedP02: 0.0700252801179886
[PLIST]         Tag6ToneMappedImageBlueChannelSkinBasedHighKey: 0.999969780445099
[PLIST]         Tag6ToneMappedImageBlueChannelSkinBasedBlackPoint: 0.0433250479400158
[PLIST]         Tag6ToneMappedImageBlueChannelSkinBasedP50: 0.140050560235977
[PLIST]         Tag6LinearGTCImageP98           : 0
[PLIST]         Tag6LinearGTCImageP10           : 0
[PLIST]         Tag6LinearGTCImageP75           : 0
[PLIST]         Tag6LinearGTCImageWhitePoint    : 0
[PLIST]         Tag6LinearGTCImageP25           : 0
[PLIST]         Tag6LinearGTCImageP02           : 0
[PLIST]         Tag6LinearGTCImageHighKey       : 0
[PLIST]         Tag6LinearGTCImageBlackPoint    : 0
[PLIST]         Tag6LinearGTCImageP50           : 0
[PLIST]         Tag6ToneMappedImageSkinBasedP98 : 0.42482003569603
[PLIST]         Tag6ToneMappedImageSkinBasedP10 : 0.275432765483856
[PLIST]         Tag6ToneMappedImageSkinBasedP75 : 0.3594631254673
[PLIST]         Tag6ToneMappedImageSkinBasedWhitePoint: 0.44816181063652
[PLIST]         Tag6ToneMappedImageSkinBasedP25 : 0.284769475460052
[PLIST]         Tag6ToneMappedImageSkinBasedP02 : 0.196070790290833
[PLIST]         Tag6ToneMappedImageSkinBasedHighKey: 0.999921143054962
[PLIST]         Tag6ToneMappedImageSkinBasedBlackPoint: 0.116426981985569
[PLIST]         Tag6ToneMappedImageSkinBasedP50 : 0.303442895412445
[PLIST]         TagE                            : 32
[PLIST]         Tag7PeopleRatio                 : 0.203042358160019
[PLIST]         Tag7PersonMasksValidHint        : 1
[PLIST]         Tag7SkinRatio                   : 0.000208536788704805
[PLIST]         Tag0                            : 15
[PLIST]         TagF                            : 32
[PLIST]         Tag1                            : (Binary data 51840 bytes, use -b option to extract)
[PLIST]         TagG                            : 1278226536
[IFD0]          Make                            : Apple
[IFD0]          Model                           : iPhone 17 Pro Max
[IFD0]          Orientation                     : Rotate 270 CW
[IFD0]          XResolution                     : 72
[IFD0]          YResolution                     : 72
[IFD0]          ResolutionUnit                  : inches
[IFD0]          Software                        : 26.6.2
[IFD0]          ModifyDate                      : 2026:10:04 10:52:38
[IFD0]          HostComputer                    : iPhone 17 Pro Max
[ExifIFD]       ExposureTime                    : 1/1855
[ExifIFD]       FNumber                         : 1.8
[ExifIFD]       ExposureProgram                 : Program AE
[ExifIFD]       ISO                             : 80
[ExifIFD]       ExifVersion                     : 0232
[ExifIFD]       DateTimeOriginal                : 2026:10:04 10:52:38
[ExifIFD]       CreateDate                      : 2026:10:04 10:52:38
[ExifIFD]       OffsetTime                      : -07:00
[ExifIFD]       OffsetTimeOriginal              : -07:00
[ExifIFD]       OffsetTimeDigitized             : -07:00
[ExifIFD]       ShutterSpeedValue               : 1/1855
[ExifIFD]       ApertureValue                   : 1.8
[ExifIFD]       BrightnessValue                 : 8.553559974
[ExifIFD]       ExposureCompensation            : 0
[ExifIFD]       MeteringMode                    : Multi-segment
[ExifIFD]       Flash                           : Off, Did not fire
[ExifIFD]       FocalLength                     : 6.8 mm
[ExifIFD]       SubjectArea                     : 2853 2140 3142 1881
[ExifIFD]       SubSecTimeOriginal              : 408
[ExifIFD]       SubSecTimeDigitized             : 408
[ExifIFD]       ColorSpace                      : Uncalibrated
[ExifIFD]       ExifImageWidth                  : 5712
[ExifIFD]       ExifImageHeight                 : 4284
[ExifIFD]       SensingMethod                   : One-chip color area
[ExifIFD]       SceneType                       : Directly photographed
[ExifIFD]       ExposureMode                    : Auto
[ExifIFD]       WhiteBalance                    : Auto
[ExifIFD]       FocalLengthIn35mmFormat         : 24 mm
[ExifIFD]       LensInfo                        : 2.220000029-16.890625mm f/1.779999971-2.798828125
[ExifIFD]       LensMake                        : Apple
[ExifIFD]       LensModel                       : iPhone 17 Pro Max back triple camera 6.765mm f/1.78
[ExifIFD]       CompositeImage                  : General Composite Image
[Apple]         MakerNoteVersion                : 16
[Apple]         RunTimeFlags                    : Valid
[Apple]         RunTimeValue                    : 811783513143875
[Apple]         RunTimeScale                    : 1000000000
[Apple]         RunTimeEpoch                    : 0
[Apple]         AEStable                        : No
[Apple]         AETarget                        : 181
[Apple]         AEAverage                       : 192
[Apple]         AFStable                        : Yes
[Apple]         AccelerationVector              : 0.04068499432 -0.7018492222 -0.6641786693
[Apple]         FocusDistanceRange              : 1.62 - 1.63 m
[Apple]         ImageCaptureType                : Scene
[Apple]         LivePhotoVideoIndex             : 8595185700
[Apple]         PhotosAppFeatureFlags           : 0
[Apple]         HDRHeadroom                     : 1.00999999
[Apple]         AFPerformance                   : 116 1 65
[Apple]         SignalToNoiseRatio              : 59.34306718
[Apple]         PhotoIdentifier                 : 7469D9D2-A5C2-4D89-8838-B940F1AE4F0A
[Apple]         ColorTemperature                : 5068
[Apple]         CameraType                      : Back Normal
[Apple]         FocusPosition                   : 92
[Apple]         HDRGain                         : 0.003320206888
[Apple]         AFMeasuredDepth                 : 118
[Apple]         AFConfidence                    : 100
[GPS]           GPSLatitudeRef                  : North
[GPS]           GPSLatitude                     : 34 deg 0' 16.26"
[GPS]           GPSLongitudeRef                 : West
[GPS]           GPSLongitude                    : 118 deg 1' 8.72"
[GPS]           GPSAltitudeRef                  : Above Sea Level
[GPS]           GPSAltitude                     : 267.5076419 m
[GPS]           GPSTimeStamp                    : 17:52:33.99
[GPS]           GPSSpeedRef                     : km/h
[GPS]           GPSSpeed                        : 0.02369904567
[GPS]           GPSImgDirectionRef              : True North
[GPS]           GPSImgDirection                 : 341.3837129
[GPS]           GPSDestBearingRef               : True North
[GPS]           GPSDestBearing                  : 341.3837129
[GPS]           GPSDateStamp                    : 2026:10:04
[GPS]           GPSHPositioningError            : 4.7752929 m
[ICC-header]    ProfileCMMType                  : Apple Computer Inc.
[ICC-header]    ProfileVersion                  : 4.0.0
[ICC-header]    ProfileClass                    : Display Device Profile
[ICC-header]    ColorSpaceData                  : RGB
[ICC-header]    ProfileConnectionSpace          : XYZ
[ICC-header]    ProfileDateTime                 : 2022:01:01 00:00:00
[ICC-header]    ProfileFileSignature            : acsp
[ICC-header]    PrimaryPlatform                 : Apple Computer Inc.
[ICC-header]    CMMFlags                        : Not Embedded, Independent
[ICC-header]    DeviceManufacturer              : Apple Computer Inc.
[ICC-header]    DeviceModel                     : 
[ICC-header]    DeviceAttributes                : Reflective, Glossy, Positive, Color
[ICC-header]    RenderingIntent                 : Perceptual
[ICC-header]    ConnectionSpaceIlluminant       : 0.9642 1 0.82491
[ICC-header]    ProfileCreator                  : Apple Computer Inc.
[ICC-header]    ProfileID                       : 0
[ICC_Profile]   ProfileDescription              : Display P3
[ICC_Profile]   ProfileCopyright                : Copyright Apple Inc., 2022
[ICC_Profile]   MediaWhitePoint                 : 0.96419 1 0.82489
[ICC_Profile]   RedMatrixColumn                 : 0.51512 0.2412 -0.00105
[ICC_Profile]   GreenMatrixColumn               : 0.29198 0.69225 0.04189
[ICC_Profile]   BlueMatrixColumn                : 0.1571 0.06657 0.78407
[ICC_Profile]   RedTRC                          : (Binary data 32 bytes, use -b option to extract)
[ICC_Profile]   ChromaticAdaptation             : 1.04788 0.02292 -0.0502 0.02959 0.99048 -0.01706 -0.00923 0.01508 0.75168
[ICC_Profile]   BlueTRC                         : (Binary data 32 bytes, use -b option to extract)
[ICC_Profile]   GreenTRC                        : (Binary data 32 bytes, use -b option to extract)
[ICC-header2]   ProfileCMMType                  : Apple Computer Inc.
[ICC-header2]   ProfileVersion                  : 4.0.0
[ICC-header2]   ProfileClass                    : Display Device Profile
[ICC-header2]   ColorSpaceData                  : RGB
[ICC-header2]   ProfileConnectionSpace          : XYZ
[ICC-header2]   ProfileDateTime                 : 2019:01:01 00:00:00
[ICC-header2]   ProfileFileSignature            : acsp
[ICC-header2]   PrimaryPlatform                 : Apple Computer Inc.
[ICC-header2]   CMMFlags                        : Not Embedded, Independent
[ICC-header2]   DeviceManufacturer              : Apple Computer Inc.
[ICC-header2]   DeviceModel                     : 
[ICC-header2]   DeviceAttributes                : Reflective, Glossy, Positive, Color
[ICC-header2]   RenderingIntent                 : Perceptual
[ICC-header2]   ConnectionSpaceIlluminant       : 0.9642 1 0.82491
[ICC-header2]   ProfileCreator                  : Apple Computer Inc.
[ICC-header2]   ProfileID                       : ed8524d516273425acd1a9f40574c111
[ICC_Profile2]  ProfileDescription              : sRGB IEC61966-2.1 Linear
[ICC_Profile2]  ProfileCopyright                : Copyright Apple Inc., 2019
[ICC_Profile2]  MediaWhitePoint                 : 0.9642 1 0.82491
[ICC_Profile2]  RedMatrixColumn                 : 0.43607 0.22249 0.01392
[ICC_Profile2]  GreenMatrixColumn               : 0.38515 0.71687 0.09708
[ICC_Profile2]  BlueMatrixColumn                : 0.14307 0.06061 0.7141
[ICC_Profile2]  RedTRC                          : (Binary data 16 bytes, use -b option to extract)
[ICC_Profile2]  ChromaticAdaptation             : 1.04788 0.02292 -0.0502 0.02959 0.99048 -0.01706 -0.00923 0.01508 0.75168
[ICC_Profile2]  BlueTRC                         : (Binary data 16 bytes, use -b option to extract)
[ICC_Profile2]  GreenTRC                        : (Binary data 16 bytes, use -b option to extract)
[ICC-cicp2]     ColorPrimaries                  : BT.709
[ICC-cicp2]     TransferCharacteristics         : Linear
[ICC-cicp2]     MatrixCoefficients              : Identity matrix
[ICC-cicp2]     VideoFullRangeFlag              : Full
[ICC-header3]   ProfileCMMType                  : Apple Computer Inc.
[ICC-header3]   ProfileVersion                  : 4.0.0
[ICC-header3]   ProfileClass                    : Display Device Profile
[ICC-header3]   ColorSpaceData                  : RGB
[ICC-header3]   ProfileConnectionSpace          : XYZ
[ICC-header3]   ProfileDateTime                 : 2019:01:01 00:00:00
[ICC-header3]   ProfileFileSignature            : acsp
[ICC-header3]   PrimaryPlatform                 : Apple Computer Inc.
[ICC-header3]   CMMFlags                        : Not Embedded, Independent
[ICC-header3]   DeviceManufacturer              : Apple Computer Inc.
[ICC-header3]   DeviceModel                     : 
[ICC-header3]   DeviceAttributes                : Reflective, Glossy, Positive, Color
[ICC-header3]   RenderingIntent                 : Perceptual
[ICC-header3]   ConnectionSpaceIlluminant       : 0.9642 1 0.82491
[ICC-header3]   ProfileCreator                  : Apple Computer Inc.
[ICC-header3]   ProfileID                       : 5fbfd541cbee4e95e59562c4b432e80f
[ICC_Profile3]  ProfileDescription              : Display P3 Linear
[ICC_Profile3]  ProfileCopyright                : Copyright Apple Inc., 2019
[ICC_Profile3]  MediaWhitePoint                 : 0.9642 1 0.82491
[ICC_Profile3]  RedMatrixColumn                 : 0.51512 0.2412 -0.00105
[ICC_Profile3]  GreenMatrixColumn               : 0.29198 0.69225 0.04189
[ICC_Profile3]  BlueMatrixColumn                : 0.1571 0.06657 0.78407
[ICC_Profile3]  RedTRC                          : (Binary data 16 bytes, use -b option to extract)
[ICC_Profile3]  ChromaticAdaptation             : 1.04788 0.02292 -0.0502 0.02959 0.99048 -0.01706 -0.00923 0.01508 0.75168
[ICC_Profile3]  BlueTRC                         : (Binary data 16 bytes, use -b option to extract)
[ICC_Profile3]  GreenTRC                        : (Binary data 16 bytes, use -b option to extract)
[ICC-cicp3]     ColorPrimaries                  : SMPTE EG 432-1
[ICC-cicp3]     TransferCharacteristics         : Linear
[ICC-cicp3]     MatrixCoefficients              : Identity matrix
[ICC-cicp3]     VideoFullRangeFlag              : Full
[ICC-header4]   ProfileCMMType                  : Apple Computer Inc.
[ICC-header4]   ProfileVersion                  : 4.4.0
[ICC-header4]   ProfileClass                    : Display Device Profile
[ICC-header4]   ColorSpaceData                  : RGB
[ICC-header4]   ProfileConnectionSpace          : XYZ
[ICC-header4]   ProfileDateTime                 : 2026:10:04 11:06:39
[ICC-header4]   ProfileFileSignature            : acsp
[ICC-header4]   PrimaryPlatform                 : Apple Computer Inc.
[ICC-header4]   CMMFlags                        : Not Embedded, Independent
[ICC-header4]   DeviceManufacturer              : Apple Computer Inc.
[ICC-header4]   DeviceModel                     : 
[ICC-header4]   DeviceAttributes                : Reflective, Glossy, Positive, Color
[ICC-header4]   RenderingIntent                 : Perceptual
[ICC-header4]   ConnectionSpaceIlluminant       : 0.9642 1 0.82491
[ICC-header4]   ProfileCreator                  : Apple Computer Inc.
[ICC-header4]   ProfileID                       : 0
[ICC_Profile4]  ProfileDescription              : Display P3 Primaries; PQ (Adaptive Gain Curve 01EC2D57A8448184)
[ICC_Profile4]  ProfileCopyright                : Copyright Apple Inc., 2026
[ICC_Profile4]  MediaWhitePoint                 : 0.96419 1 0.82489
[ICC_Profile4]  AToB0                           : (Binary data 19478 bytes, use -b option to extract)
[ICC_Profile4]  BToA0                           : (Binary data 6412 bytes, use -b option to extract)
[ICC_Profile4]  ChromaticAdaptation             : 1.04788 0.02292 -0.0502 0.02959 0.99048 -0.01706 -0.00923 0.01508 0.75168
[ICC_Profile4]  HDGainMapInfo                   : (Binary data 230 bytes, use -b option to extract)
[ICC-cicp4]     ColorPrimaries                  : SMPTE EG 432-1
[ICC-cicp4]     TransferCharacteristics         : SMPTE ST 2084, ITU BT.2100 PQ
[ICC-cicp4]     MatrixCoefficients              : Identity matrix
[ICC-cicp4]     VideoFullRangeFlag              : Full
[Composite]     RunTimeSincePowerUp             : 9 days 9:29:44
[Composite]     Aperture                        : 1.8
[Composite]     ImageSize                       : 5712x4284
[Composite]     Megapixels                      : 24.5
[Composite]     ScaleFactor35efl                : 3.5
[Composite]     ShutterSpeed                    : 1/1855
[Composite]     SubSecCreateDate                : 2026:10:04 10:52:38.408-07:00
[Composite]     SubSecDateTimeOriginal          : 2026:10:04 10:52:38.408-07:00
[Composite]     SubSecModifyDate                : 2026:10:04 10:52:38-07:00
[Composite]     GPSAltitude                     : 267.5 m Above Sea Level
[Composite]     GPSDateTime                     : 2026:10:04 17:52:33.99Z
[Composite]     GPSLatitude                     : 34 deg 0' 16.26" N
[Composite]     GPSLongitude                    : 118 deg 1' 8.72" W
[Composite]     CircleOfConfusion               : 0.008 mm
[Composite]     FOV                             : 73.7 deg
[Composite]     FocalLength35efl                : 6.8 mm (35 mm equivalent: 24.0 mm)
[Composite]     GPSPosition                     : 34 deg 0' 16.26" N, 118 deg 1' 8.72" W
[Composite]     HyperfocalDistance              : 3.04 m
[Composite]     LightValue                      : 12.8
[Composite]     LensID                          : iPhone 17 Pro Max back triple camera 6.765mm f/1.78
```
