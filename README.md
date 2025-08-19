# MichaelLedger.github.io

Personal Website.

Copyright © 2018 MTX Software Technology Co.,Ltd. All rights reserved. Designed by MichaelLedger. 

For personal study only, please do not reprint, not for any commercial use.

## Local Development

Run `% python3 -m http.server 8888` in the root directory to start a simple HTTP server.

Then visit `http://localhost:8888/blog/index.html` in your browser.

## Blogs Publishing Steps
1. Markdown files are stored in `markdowns` directory.
Duplicate the `developer_8.md` file and rename it to your desired filename, such as `developer_9.md`.

2. Modify the corresponding suffix number in the filename and other relative content (e.g. title & date & audio) in xml, such as `blog/english.xml`.

3. Find the publish content in your websites, such as:
[可可英语-老友记-中英翻译](https://www.kekenet.com/video/201610/473421.shtml)
[可可英语-老友记-英文标题](https://m.kekenet.com/video/tv/Friends/Season9/)

4. Escape line breaks with `<br>` in Markdown files via shell script:
[EscapeLineBreak](https://github.com/MichaelLedger/Shell-Collection/tree/master/EscapeLineBreak)

4.1 paste the markdown content from the websites into `word.txt`
`open words.txt`

4.2 run the shell script to escape line breaks:
`sh shell.sh`

4.3 the text content in 'escaped.txt' will auto copied to your clipboard!

5. Download the audio file from the website and rename it to `friends_s09e14_b.mp3`.

6. Push the audio file to the corresponding feature branch (e.g. `audio/english/friends/season9`) in another repository:

```
% git clone https://github.com/MichaelLedger/media media
% cd media
% pwd
% git checkout audio/english/friends/season9
```

[Media - audio/english/friends/season9](https://github.com/MichaelLedger/media/tree/audio/english/friends/season9)

[Media - All branches](https://github.com/MichaelLedger/media/branches/all)

7. After pushing the audio file, we can get the audio URL, such as:
[Audio]https://raw.githubusercontent.com/michaelledger/media/refs/heads/audio/english/friends/season9/friends_s09e14_b.mp3`

8. Other resources like images can be uploaded to the `media` repository in the same way (e.g. feature branch `image/english/friends/cover`).
[Image](https://raw.githubusercontent.com/michaelledger/media/refs/heads/image/english/friends/cover/friends_season9_cover.jpg)

You can always create a new feature branch for your media files and upload them there.
```
% git checkout -b audio/english/xxx
% git add xxx.mp3
% git commit -m "Add audio for xxx"
% git push origin -u audio/english/xxx
```

9. Push the new markdown file & modified xml to the `master` branch of the `michaelledger.github.io` repository

9.1 Before pushing, you can preview the blog via Safari by opening the `index.html` file in the `blog` directory:
[Local - English](file:///Users/gavinxiang/Downloads/MichaelLedger.github.io/blog/index.html)
[Local - Academic](file:///Users/gavinxiang/Downloads/MichaelLedger.github.io/blog/academic.html)
[Local - Developer](file:///Users/gavinxiang/Downloads/MichaelLedger.github.io/blog/developer.html)
[Local - Korean](file:///Users/gavinxiang/Downloads/MichaelLedger.github.io/blog/korean.html)
[Local - Japan](file:///Users/gavinxiang/Downloads/MichaelLedger.github.io/blog/japan.html)

9.2 Besure to disable local file restrictions in Safari settings:
`Safari > Preferences > Developer > Security > ☑️ Disable Local File Restrictions`

10. After pushing the changes, visit the website to see the new blog post:
[Blog - English](https://michaelledger.github.io/blog/index.html)
[Blog - Academic](https://michaelledger.github.io/blog/academic.html)
[Blog - Developer](https://michaelledger.github.io/blog/developer.html)
[Blog - Korean](https://michaelledger.github.io/blog/korean.html)
[Blog - Japan](https://michaelledger.github.io/blog/japan.html)

*NOTE: Github resources may not be available or very slow in China, so you can use a proxy or VPN to access the website.*
