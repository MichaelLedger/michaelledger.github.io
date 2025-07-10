# How to remove files permanently from git history

Imagine you have a secure file or a big file that does not need to be sent to git, but as you didn’t know how to do that you sent tenths of commits with this file and now you decided to remove it.
If you just remove it normally and add to `.gitgnore` it will remove from your current commit but not from all the pasts commit.
You will need to use BFG Repo-Cleaner to remove this file from all the past commits.

## Step 1 — Remove from current commit

As in this StackOverFlow answer remove the file from your current commit using the following code:
```
git rm my_password.txt
git commit -m "Remove sensitive data"
git push origin master
```

## Step 2 —Ignore the file from your future commits
Add the file name to your `.gitgnore` file in the root of your project.

- Create a file named `.gitgnore`. If you have difficulties to do that check this StackOverFlow answer. The answer is for Windows and in the comments you check how to do it for MacOS.

- Insert the file you want to ignore to `.gitgnore`
```
# git ls-files --others --exclude-from=.git/info/exclude
# Lines that start with '#' are comments.
# For a project mostly in C, the following would be a good set of
# exclude patterns (uncomment them if you want to use them):
# *.[oa]
# *~
# ignore passwords
my_password.txt
```

## Step 3 — Remove the file from history

方法一、git filter-branch
关于git仓库的清理，主要就是清理git仓库里面的大的。网上查了很多教程，很多都是用：`git filter-branch` 清理仓库中的大文件。

我尝试着本地测试了一下，发现是真慢呀。

step1：查看又哪些大文件（查看前5个大文件）

`git rev-list --objects --all | grep "$(git verify-pack -v .git/objects/pack/*.idx | sort -k 3 -n | tail -5 | awk '{print$1}')"`

step2: 从仓库中删除文件或文件夹

`git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch path-to-your-remove-file' --prune-empty --tag-name-filter cat -- --all`

`git filter-branch --index-filter` 让每个提交的文件都复制到索引(.git/index)中

然后运行过滤器命令：`git rm --cached --ignore-unmatch` 文件名 ，让每个提交都删除掉“文件名”文件

然后`--prune-empty` 把空的提交“修剪”掉 

然后`--tag-name-filter cat` 把每个tag保持原名字，指向修改后的对应提交

最后`-- --all` 将所有ref（包括branch、tag）都执行上面的重写

step 3：删除缓存下来的ref和git操作（这一步可以跳过，也可以不执行）

`git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin`

step4：运行git gc清理

`git reflog expire --expire=now --all && git gc --prune=now --aggressive`

step5：强制推送到远端

`git push --force origin master`

反正用这个方法没成功，感觉问题出在最后的推送上，因为我本地是瘦身成功的。网上搜到一些说是要把分支删得只剩master再操作。

方法二：BFG Repo-Cleaner

In this final step you will use [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/).
- Download the file from the link
- Rename it to bfg.jar
- Paste it in the root of your git repository.
- Run `java -jar bfg.jar --delete-files my_password.txt` . You will get a message saying BFG run is complete!.
- Push your changes to git.

## [BFG Repo-Cleaner](https://github.com/rtyley/bfg-repo-cleaner)
Removes large or troublesome blobs like `git-filter-branch` does, but faster. And written in Scala

这个工具很快，而且会给出清理文件和受保护分支。清理后的report很清晰，推荐使用这个。git很多周边工具还是挺好用的。

环境要求：安装了java的机器。

工具下载：https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

 工具拷贝到机器的某个位置，可重命名为bfg.jar。

我是直接对gerrit的裸库进行操作的。

step1: 在gerrit服务home目录的git目录下找到对应要瘦身仓库的.git目录。

step2: 运行如下命令：(清理大于500M的提交)

`java -jar bfg.jar --strip-blobs-bigger-than 500M /usr/local/gerrit/git/common/test.git`

step3: 运行如下命令进行 `git gc`

`git reflog expire --expire=now --all && git gc --prune=now --aggressive`

这样就完成裸库清理，启动gerrit服务即可。

我看guide里面最后一步都是强制推送：`git push origin master --force`

我感觉推完我还是没有瘦身成功，所以直接在裸库上操作了。

写在最后：

*这个重写git仓库太伤了，非必要不操作，且做好备份！*

[Git 内部原理 - 维护与数据恢复](https://git-scm.com/book/zh/v2/Git-内部原理-维护与数据恢复)

## Mine Resolution
Make sure all stashed blobs are saved in your feature branches and all your local branches are pushed to remote!
Delete the repo directory completely and re-clone it from latest branch, usually is `master` or `main`, only check out branches which you need to develop on!

### Reference
[How to remove files permanently from git history](https://soonsantos.medium.com/how-to-remove-files-permanently-from-git-history-d0916202fdf7)
[git仓库清理](https://blog.csdn.net/zhulianseu/article/details/132023627)
