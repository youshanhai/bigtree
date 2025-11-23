---
title: Hexo中使用图片和音乐
date: 2025-11-23 09:00:00
tags:
- hexo
---
categories:
- hexo


### 一、图片插入

使用hexo-asset-image来显示图片
[Git地址](https://github.com/CodeFalling/hexo-asset-image)

1、博客根目录输入

```
npm install hexo-asset-img --save

```

2、博客根目录修改_config.yml配置文件post_asset_folder项为 true。
3、创建文章的时候会在source/_posts生成相同名字的文件夹，用来存放图片文件

<!-- more -->

4、使用

```
![“图片描述”（可以不写）](/你的图片名字.JPG)
例如：

![](shu.jpg)

```

![](./Hexo中使用图片和音乐/shu.jpg)

5、或者使用HTML标签显示

```
<img src="shu.jpg">

```
<img src="shu.jpg">

6、gif同图片

```
![gif](gif.gif)
```

![gif](./Hexo中使用图片和音乐/gif.gif)

### 二、播放音乐

1、网易音乐

浏览器打开网易云音乐，搜索想要的歌曲，点击歌曲名字进入播放器页面，点击“生成外链播放器”。
复制到这边就可以了

```
<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="https://music.163.com/outchain/player?type=2&id=462213854&auto=0&height=66"></iframe>

```

<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="https://music.163.com/outchain/player?type=2&id= 462213854&auto=1&height=66"></iframe>

2、本地音乐

将音乐文件放在文章同名的资源文件夹中，使用 HTML5 的 `<audio>` 标签播放：

```html
<audio controls>
  <source src="大王叫我来巡山.mp3" type="audio/mpeg">
  您的浏览器不支持 audio 元素。
</audio>
```

<audio controls>
  <source src="大王叫我来巡山.mp3" type="audio/mpeg">
  您的浏览器不支持 audio 元素。
</audio>

可选属性：
- `controls`: 显示播放控件
- `autoplay`: 自动播放
- `loop`: 循环播放
- `preload="none"`: 不预加载（节省流量）

### 三、视频

使用iframe标签

```
<iframe   
    height=498 width=510 
    autoPlay=false 
    src="https://player.youku.com/embed/XNjcyMDU4Njg0"   
    frameborder=0 allowfullscreen>  
</iframe> 
```

 <iframe   
    height=498 width=510 
    autoPlay=false 
    src="https://player.youku.com/embed/XNjcyMDU4Njg0"   
    frameborder=0 allowfullscreen>  
</iframe> 






