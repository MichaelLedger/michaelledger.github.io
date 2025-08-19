# MacOS 使用 Charles 对 iOS 模拟器进行抓包

$$October 25, 2023$$

环境：
系统：macOS 10.15.4
抓包软件：Charles V4.5.6
模拟器：iPhone 8（iOS 12.4）

## 前期准备：
1、打开 Charles；
2、打开任一模拟器；
3、关闭电脑上的代理软件或代理服务。

## 步骤
一、打开 Charles，点击顶部菜单栏的 Proxy -> 勾选 macOS Proxy；
二、继续在 Charles 里，点击顶部菜单栏的 Help -> SSL Proxying -> Install Charles Root Certificate in iOS Simulators；
*电脑上安装Charles根证书Install Charles Root Certificate，并在钥匙串中设置为信任*；
三、打开模拟器 -> 设置 App -> 通用 -> 关于本机 -> 滑到底部 -> 证书信任设置，点开后会看到 Charles Proxy CA（…），这时把证书开关打开；
四、打开模拟器的 Safari 浏览器，在地址栏输入 `http://chls.pro/ssl`，这时会弹出弹窗提示你安装描述文件，点允许安装;
*如果safari打开https无效，用http协议打开即可！*
*如果无法正常加载，可以通过顶部菜单栏的SSL Proxying -> Save Charles Root Certificate, 然后通过 AirDrop 同步到指定iPhone/Simulator*
五、回到设置 App -> 通用 -> 滑到下面 -> 描述文件 -> 看到 Charles Proxy CA（…）-> 点击证书 -> 点击导航栏右上角安装 Charles 的描述文件；
*Note that on iOS 10 and later you must then trust the certificate.
Go to Settings > General > About > Certificate Trust Settings and enable full trust for the Charles Proxy certificate.*
六、打开电脑的系统偏好设置 App -> 网络 -> 记住你当前连接网络的 IP（如当前连接了 Wi-Fi）-> 点击右下角的高级 -> 弹出的窗口里 -> 点击代理 -> 选中【网页代理(HTTP)】
(macOS 14入口: Wi-Fi -> 详细信息... -> 代理 -> 网页代理(HTTP) & 安全网页代理(HTTPS))
在地址栏和端口填入刚刚记住的 IP 地址和端口8888（如果不是8888，请到 Charles -> Proxy 里查看具体的端口），同理，下方的【安全网页代理(HTTPS)】也一样输入 IP:Port，填好后点击“好”并应用；
Proxy -> SSL Proxying Settings -> SSL Proxying -> Include Add
```
Host: https://xxx.yyy.com
Port: *
```
*如果要对所有的host进行代理设置，可以设置为* `*:*`
七、打开模拟器，打开你的 App 或网页抓取你需要的数据吧。

## Charles 模拟弱网
打开Proxy->Throttle Settings

## 注意事项
**抓包结束后，请按步骤6回到电脑系统设置页，把网页代理和安全网页代理去掉，否则关掉 Charles 后电脑上不了网。**

## Edge Cases
**Passkey**
Charles设置代理真机抓包会导致Passkey系统域名配置校验失败，需要关闭网络代理才能验证通过！

`https://www.xxx.com/.well-known/apple-app-site-association`

```
"NSLocalizedFailureReason": Application with identifier <Team-ID>.<Bundle-ID> is not associated with domain xxx.com
ASAuthorizationController credential request failed with error: Error Domain=com.apple.AuthenticationServices.AuthorizationError Code=1004
```

**iCloud Photo**
如果你的apple账户图片存储在icloud，第一次下载的时候不能开代理，否则图片无法下载
```
https://gateway.icloud.com
SSL handshake with client failed - Remote host terminated the handshake
```

**Peer does not support HTTP/2 properly (e.g. upload API)**
Charles -> Proxy Settings... -> Proxies -> HTTP Proxy -> Deselect ☑️ Support HTTP/2
```
HTTP/2 error encountered on Connection 193 (Code 18,446,744,073,709,551,080): Remote peer returned unexpected data while we expected SETTINGS frame.  Perhaps, peer does not support HTTP/2 properly.
```
```
16:20:50.381 ❤️ ERROR APIRequest.mulipartFormDataWithFileV2():436 - URLSessionTask failed with error: The network connection was lost. Network.error
Task <A0B03193-7273-40A5-8BFD-735B3B988728>.<10> HTTP load failed, 66,064/0 bytes (error code: 18,446,744,073,709,550,611 [1:57])
Task <A0B03193-7273-40A5-8BFD-735B3B988728>.<10> finished with error [18,446,744,073,709,550,611] Error Domain=NSURLErrorDomain Code=-1005 "The network connection was lost." UserInfo={_kCFStreamErrorCodeKey=57, NSUnderlyingError=0x159fa63d0 {Error Domain=kCFErrorDomainCFNetwork Code=-1005 "(null)" UserInfo={_kCFStreamErrorCodeKey=57, _kCFStreamErrorDomainKey=1}}, _NSURLErrorFailingURLSessionTaskErrorKey=LocalUploadTask <A0B03193-7273-40A5-8BFD-735B3B988728>.<10>, _NSURLErrorRelatedURLSessionTaskErrorKey=(
    "LocalUploadTask <A0B03193-7273-40A5-8BFD-735B3B988728>.<10>"
), NSLocalizedDescription=The network connection was lost., NSErrorFailingURLStringKey=https://mapi.personalcreations.com/pca/v2/photo, NSErrorFailingURLKey=https://mapi.personalcreations.com/pca/v2/photo, _kCFStreamErrorDomainKey=1}
```

```
(lldb) po error
▿ AFError
  ▿ sessionTaskFailed : 1 element
    - error : Error Domain=NSURLErrorDomain Code=-1005 "The network connection was lost." UserInfo={_kCFStreamErrorCodeKey=57, NSUnderlyingError=0x166d9d650 {Error Domain=kCFErrorDomainCFNetwork Code=-1005 "(null)" UserInfo={_kCFStreamErrorCodeKey=57, _kCFStreamErrorDomainKey=1}}, _NSURLErrorFailingURLSessionTaskErrorKey=LocalUploadTask <3DB2A638-BD37-4E0C-BCC9-FE86DC994D38>.<11>, _NSURLErrorRelatedURLSessionTaskErrorKey=(
    "LocalUploadTask <3DB2A638-BD37-4E0C-BCC9-FE86DC994D38>.<11>"
), NSLocalizedDescription=The network connection was lost., NSErrorFailingURLStringKey=https://mapi.personalcreations.com/pca/v2/photo, NSErrorFailingURLKey=https://mapi.personalcreations.com/pca/v2/photo, _kCFStreamErrorDomainKey=1}
```
