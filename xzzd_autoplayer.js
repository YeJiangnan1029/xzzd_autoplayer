    // ==UserScript==
    // @name         XXZD-autoplayer
    // @namespace    https://github.com/YeJiangnan1029/
    // @version      2023-12-15
    // @description  Automatically playing videos in XZZD, speedup and silence
    // @author       ybqaq
    // @match        https://courses.zju.edu.cn/course/*
    // @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
    // @require      https://scriptcat.org/lib/513/2.0.0/ElementGetter.js
    // @license      MIT
    // @grant        none
    // ==/UserScript==



    (function() {
        'use strict';

        // parameters
        var SPEEDUP = 1;

        (async function() {
            // 搜集所有视频链接
            var url_list = new Array();
            var wrapper = await elmGetter.get("div.module.ng-scope ul");
            await elmGetter.each("li.ng-scope", wrapper, (chapter_module, isInserted) => {
                // console.log(chapter_module);
                var parent_node = chapter_module.querySelector("ul.activity-list.module-activity");
                elmGetter.each("a.activity-title", parent_node, (url, ii) => {
                    if (!url_list.includes(url)) {
                        url_list.push(url);
                    }
                });
            });
            // for (var i = 0, len = url_list.length; i < len; i++) {
            //     var url = url_list[i];
            //     console.log(url.innerText);
            // }
            var curUrl = await elmGetter.get("li.activity.ng-scope.active a.activity-title");
            // console.log(curUrl.innerText);
            let curIndex = url_list.indexOf(curUrl);
            if (curIndex !== -1) {
                url_list.splice(0, curIndex);
            }

            // 播放当前video
            var video = await elmGetter.get("video");
            url_list.shift();
            playVideo(video);

            // 播放下一个video的函数，绑定在video的ended事件
            async function playNextVideo() {
                console.log('ended play');
                // 点击下一个页面
                if (url_list.length > 0) {
                    var nexturl = url_list.shift();
                    nexturl.click();
                    console.log("next url clicked");
                }

                // 寻找当前页面视频
                window.location.reload();
                var video = await elmGetter.get("video");
                playVideo(video);

            }

            async function playVideo(video) {
                console.log(video);
                video.muted = true;
                video.playbackRate = SPEEDUP;

                // 设置播放完毕的回调函数，自动播放下一个
                video.addEventListener('ended', playNextVideo);

                // 设置播放速率 使用闭包包装 meetCount 变量
                var meetCountModule = (function() {
                    var meetCount = 0;

                    function setVideoSpeed(ele_video, speed) {
                        if (ele_video.playbackRate === speed) {
                            meetCount += 1;
                        } else {
                            ele_video.playbackRate = speed;
                        }

                        if (meetCount >= 3) {
                            clearInterval(t1);
                        }
                    }
                    return {
                        setVideoSpeed: setVideoSpeed,
                        getMeetCount: function() {
                            return meetCount;
                        }
                    };
                })();
                let t1 = setInterval(() => meetCountModule.setVideoSpeed(video, SPEEDUP), 2000);

                // 模拟点击按钮，防止被判为拉动进度条
                var btn_play = await elmGetter.get(".mvp-toggle-play.mvp-first-btn-margin");

                console.log("检测到播放按钮");
                console.log(btn_play);

                // 暂停时自动点击播放
                function aotuResumeVideo(ele_video, ele_btn) {
                    // console.log(video.paused);
                    if (ele_video.ended) {
                        clearInterval(t2);
                    } else if (ele_video.paused) {
                        ele_btn.click();
                        console.log("clicked");
                    }

                }
                let t2 = setInterval(() => aotuResumeVideo(video, btn_play), 2000);
            }

        })();


    })();