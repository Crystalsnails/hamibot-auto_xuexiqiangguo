// 检查无障碍服务是否已经启用
auto.waitFor();

/**
 * 获取配置参数及本地存储数据
 */
// 基础数据
var { four_player_battle } = hamibot.env;
var { two_player_battle } = hamibot.env;
var { four_player_count } = hamibot.env;
var { two_player_count } = hamibot.env;
var { contest_delay_time } = hamibot.env;
var delay_time = 1000;
four_player_count = Number(four_player_count);
two_player_count = Number(two_player_count);
contest_delay_time = Number(contest_delay_time) * 1000;

/**
 * 模拟随机时间
 * @param {int} time 时间
 * @return {int} 随机后的时间值
 */
function random_time(time) {
    return time + random(100, 1000);
}

sleep(random_time(delay_time));
launch('com.hamibot.hamibot');
textMatches(/Hamibot|日志/).waitFor();
toastLog("答错脚本正在运行");
sleep(random_time(delay_time));

/**
 * 模拟点击可点击元素
 * @param {string} target 控件文本
 */
function my_click_clickable(target) {
    text(target).waitFor();
    // 防止点到页面中其他有包含“我的”的控件，比如搜索栏
    if (target == "我的") {
        id("comm_head_xuexi_mine").findOne().click();
    } else {
        click(target);
    }
}

/**
 * 点击对应的去答题
 * @param {int} number 10和11分别为四人赛双人对战
 */
function entry_model(number) {
    sleep(random_time(delay_time * 2));
    var model = className("android.view.View").depth(24).findOnce(number);
    while (!model.child(4).click());
}

/**
 * 如果因为某种不知道的bug退出了界面，则使其回到正轨
 */
function back_track() {
    app.launchApp("学习强国");
    sleep(random_time(delay_time * 3));
    var while_count = 0;
    while (!id("comm_head_title").exists() && while_count < 5) {
        while_count++;
        back();
        sleep(random_time(delay_time));
    }
    my_click_clickable("我的");
    sleep(random_time(delay_time));
    my_click_clickable("学习积分");
    sleep(random_time(delay_time));
    text("登录").waitFor();
}

/**
 * 处理访问异常
 */
function handling_access_exceptions() {
    // 在子线程执行的定时器，如果不用子线程，则无法获取弹出页面的控件
    var thread_handling_access_exceptions = threads.start(function () {
        var zz = 0;
        while (true) {
            textContains("访问异常").waitFor();
            // 滑动按钮“>>”位置
            idContains("nc_1_n1t").waitFor();
            var bound = idContains("nc_1_n1t").findOne().bounds();
            // 滑动边框位置
            text("向右滑动验证").waitFor();
            var slider_bound = text("向右滑动验证").findOne().bounds();
            // 通过随机选择动作库中的手势验证

            /**
             * 动作库
             */
            // x轴起点位置
            var x_start = bound.centerX();
            // x轴终点位置
            var x_end = slider_bound.right;
            // y轴位置
            var y = random(bound.top, bound.bottom);
            // 随机选择手势
            var choice_number = random(1, 5);
            switch (choice_number) {
                case 1:
                    // 1. 先左后右（匀速）
                    gesture(random_time(delay_time), [x_start, y], [x_end, y]);
                case 2:
                    // 2. 先左后右（加速）
                    var x_mid1 = (x_end - x_start) * 1 / 4 + x_start;
                    var x_mid2 = (x_end - x_start) * 2 / 4 + x_start;
                    var x_mid3 = (x_end - x_start) * 3 / 4 + x_start;
                    gesture([random_time(delay_time) / 2, [x_start, y], [x_mid1, y]],
                        [random_time(delay_time) / 4, [x_mid1, y], [x_mid2, y]],
                        [random_time(delay_time) / 6, [x_mid2, y], [x_mid3, y]],
                        [random_time(delay_time) / 10, [x_mid3, y], [x_end, y]]);
                case 3:
                    // 3. 先左后右（减速）
                    var x_mid1 = (x_end - x_start) * 1 / 4 + x_start;
                    var x_mid2 = (x_end - x_start) * 2 / 4 + x_start;
                    var x_mid3 = (x_end - x_start) * 3 / 4 + x_start;
                    gesture([random_time(delay_time) / 10, [x_start, y], [x_mid1, y]],
                        [random_time(delay_time) / 6, [x_mid1, y], [x_mid2, y]],
                        [random_time(delay_time) / 4, [x_mid2, y], [x_mid3, y]],
                        [random_time(delay_time) / 2, [x_mid3, y], [x_end, y]]);
                case 4:
                    // 4. 先左后右停顿再右
                    var x_mid = (x_end - x_start) * random(5, 8) / 10 + x_start;
                    gesture(random_time(delay_time), [x_start, y], [x_mid, y], [x_mid, y], [x_end, y]);
                case 5:
                    // 5. 先右后左再右
                    var x_mid = (x_end - x_start) * random(5, 8) / 10 + x_start;
                    var back_x = (x_end - x_start) * random(2, 3) / 10;
                    gesture(random_time(delay_time), [x_start, y], [x_mid, y], [x_mid - back_x, y], [x_end, y]);
            }

            sleep(delay_time / 2);
            if (textContains("刷新").exists()) {
                zz = zz + random(1, 2);
                if (zz > 10) {
                    toastLog("多次滑动验证失败");
                    break;
                }
                click("刷新");
                continue;
            }
            if (textContains("网络开小差").exists()) {
                click("确定");
                continue;
            }
            // 执行脚本只需通过一次验证即可，防止占用资源
            break;
        }
    });
    return thread_handling_access_exceptions;
}

/* 
处理访问异常，滑动验证
*/
var thread_handling_access_exceptions = handling_access_exceptions();

//答错
function do_it() {
    while (!text("开始").exists());
    while (!text("继续挑战").exists()) {
        sleep(random_time(contest_delay_time));
        // 随机选择
        try {
            var options = className("android.widget.RadioButton").depth(32).find();
            var select = random(0, options.length - 1);
            className("android.widget.RadioButton").depth(32).findOnce(select).click();
        } catch (error) {
        }
        while (!textMatches(/第\d题/).exists() && !text("继续挑战").exists() && !text("开始").exists());
    }
}

/*
**********四人赛*********
*/
if (four_player_battle == "yes") {
    sleep(random_time(delay_time));

    if (!className("android.view.View").depth(22).text("学习积分").exists()) back_track();
    entry_model(10);

    for (var i = 0; i < four_player_count; i++) {
        sleep(random_time(delay_time));
        my_click_clickable("开始比赛");
        do_it();
        if (i < four_player_count - 1) {
            sleep(random_time(delay_time));
            while (!click("继续挑战"));
            sleep(random_time(delay_time));
        }
    }
    sleep(random_time(delay_time * 2));
    back();
    sleep(random_time(delay_time));
    back();
}

/*
**********双人对战*********
*/
if (two_player_battle == "yes") {
    sleep(random_time(delay_time));

    if (!className("android.view.View").depth(22).text("学习积分").exists()) back_track();
    entry_model(12);

    for (var i = 0; i < two_player_count; i++) {
        // 点击随机匹配
        text("随机匹配").waitFor();
        sleep(random_time(delay_time * 2));
        try {
            className("android.view.View").clickable(true).depth(24).findOnce(1).click();
        } catch (error) {
            className("android.view.View").text("").findOne().click();
        }
        do_it();
        sleep(random_time(delay_time));
        if (i < two_player_count - 1) {
            sleep(random_time(delay_time));
            while (!click("继续挑战"));
            sleep(random_time(delay_time));
        }
    }
    sleep(random_time(delay_time));
    back();
    sleep(random_time(delay_time));
    back();
    my_click_clickable("退出");
}

// 震动半秒
device.vibrate(500);
toastLog("脚本运行完成");
exit();
