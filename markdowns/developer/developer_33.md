# Storing images and audios on GitHub

New `media` repo to store all resources including audios and images and so on.

**Put into diff branches according to diff categories to minimize package size for each push.**

*remote: fatal: pack exceeds maximum allowed size (2.00 GiB)*

```
% git remote -v
origin    git@github.com:MichaelLedger/media.git (fetch)
origin    git@github.com:MichaelLedger/media.git (push)
```

```
% git co -b audio/english/friends/season1

% git ps origin -u audio/english/friends/season1
branch 'audio/english/friends/season1' set up to track 'origin/audio/english/friends/season1'.
Everything up-to-date

% git st
On branch audio/english/friends/season1
Your branch is up to date with 'origin/audio/english/friends/season1'.

nothing to commit, working tree clean
```

*audio url formats:*
```
https://github.com/michaelledger/media/blob/audio/english/friends/season1/friends_season1_episode1_part_one.mp3?raw=true
https://raw.githubusercontent.com/michaelledger/media/refs/heads/audio/english/friends/season1/friends_season1_episode1_part_one.mp3
```

**Switch to `main` branch first to clean up current workspace and commits (quick than `--orphan`).**

```
% git checkout main
% git co -b image/wallpaper/developer
% git ps origin -u image/wallpaper/developer
```

*image url formats:*
```
https://github.com/michaelledger/media/blob/image/wallpaper/developer/coding_1.jpg?raw=true
https://raw.githubusercontent.com/michaelledger/media/refs/heads/image/wallpaper/developer/coding_1.jpg
```

## [Store Images for Use in README.md on GitHub](https://medium.com/%40minamimunakata/how-to-store-images-for-use-in-readme-md-on-github-9fb54256e951)
Do you want to show screenshots or GIFs in master’s README.md as a demo for your project but don’t know where to store them?

Let’s create a new `branch` in your repository to store images so that you can avoid them being in the `master` working tree.

## Create a New Branch

Inside your repository, run the commands below and create a new branch named `media`. (You can name it whatever you want.)

`$ git checkout --orphan media`

This command create and switch a new branch ‘media’. Creating a new branch by using `--orphan` allows you to start a new history totally disconnected from all the prior commits in the other branches. It means the first commit on the new branch will not have parents and will be the root of a new history.

NOTE: You can also create a new branch by using `$ git branch media` and then switch by using `$ git checkout media`. In this case, the new branch media has the logs of prior commits.

## Remove All Files From the New Branch

Let’s remove all files from the working tree since we don’t want to store any files but images in the branch.

NOTE: Make sure that you are in the branch `media` before you run this command, otherwise everything that the working tree knows will be deleted. We want to clean up only `media` branch.

`$ git rm -rf .`

## Store Images into the Directory

`$ cp /path/to/the/image/XXXX.png .`

## Add, Commit, and Push Images

```
$ git add .
$ git commit -m "add XXXX.png into media branch"
$ git push origin media:media
```
NOTE: Assuming you have the README.md file on the `master` branch, do not forget to switch back to the `master` branch.

`$ git checkout master`

### Use the Images in README.md

Now, It’s Time to Use them in README files.

Open your favorite editor and write codes to show them.

Try examples below to define image paths in README files.

`![alt text](https://github.com/YOUR_ACCOUNT_NAME/REPOSITORY_NAME/blob/media/XXXX.png)`

[GitHub](https://help.github.com/articles/about-readmes/) recommend that you use **relative links** with the `?raw=true` instead of the absolute paths to ensure forked repo works correctly.

`![alt text](../media/XXXX.png?raw=true)`

## Update Your Remote Repo
````
$ git add --all
$ git commit -m "add XXXX.png to README.md"
$ git push origin master
```
That’s all!!

These steps let you stored the images in the `media` branch and use them in README file in the `master` branch.

## References:
- [GitHubでREADMEにgif画像を表示する簡単な方法](https://qiita.com/takuya-ki/items/13e445096752b8181de7)
