auto.waitFor();

// 保持屏幕唤醒状态
device.keepScreenDim();

/* 评估各hash值，找出最优利用率，最小平均值，最小最大值的哈希值 */

var max_utilization = 0;
var min_avg_value = 100;
var min_max_value = 100;
var max_utilization_i = 0;
var min_avg_value_i = 0;
var min_max_value_i = 0;

// 模糊词，当选项为这些词时，无法根据选项对应题目
var vague_words = '选择正确的读音 选择词语的正确词形 下列词形正确的是'
var hash_value_list = [2003,2011,2017,2027,2029,2039,2053,2063,2069,2081,2083,2087,2089,2099,2111,2113,2129,2131,2137,2141,2143,2153,2161,2179,2203,2207,2213,2221,2237,2239,2243,2251,2267,2269,2273,2281,2287,2293,2297,2309,2311,2333,2339,2341,2347,2351,2357,2371,2377,2381,2383,2389,2393,2399,2411,2417,2423,2437,2441,2447,2459,2467,2473,2477,2503,2521,2531,2539,2543,2549,2551,2557,2579,2591,2593,2609,2617,2621,2633,2647,2657,2659,2663,2671,2677,2683,2687,2689,2693,2699,2707,2711,2713,2719,2729,2731,2741,2749,2753,2767,2777,2789,2791,2797,2801,2803,2819,2833,2837,2843,2851,2857,2861,2879,2887,2897,2903,2909,2917,2927,2939,2953,2957,2963,2969,2971,2999,3001,3011,3019,3023,3037,3041,3049,3061,3067,3079,3083,3089,3109,3119,3121,3137,3163,3167,3169,3181,3187,3191,3203,3209,3217,3221,3229,3251,3253,3257,3259,3271,3299,3301,3307,3313,3319,3323,3329,3331,3343,3347,3359,3361,3371,3373,3389,3391,3407,3413,3433,3449,3457,3461,3463,3467,3469,3491,3499,3511,3517,3527,3529,3533,3539,3541,3547,3557,3559,3571,3581,3583,3593,3607,3613,3617,3623,3631,3637,3643,3659,3671,3673,3677,3691,3697,3701,3709,3719,3727,3733,3739,3761,3767,3769,3779,3793,3797,3803,3821,3823,3833,3847,3851,3853,3863,3877,3881,3889,3907,3911,3917,3919,3923,3929,3931,3943,3947,3967,3989,4001];
for (var i in hash_value_list) {
    var answer_question_map = [];
    var hash_value = hash_value_list[i]
    //   log('hash_value = ' + hash_value.toString());

    /**
     * 定义HashTable类，用于存储本地题库，查找效率更高
     * 由于hamibot不支持存储自定义对象和new Map()，因此这里用列表存储自己实现
     * 在存储时，不需要存储整个question，可以仅根据选项来对应question，这样可以省去ocr题目的花费
     * 但如果遇到选项为vague_words数组中的模糊词，无法对应question，则需要存储整个问题
    */
    // hash函数
    function hash(string) {
        var hash = 0;
        for (var i = 0; i < string.length; i++) {
            hash += string.charCodeAt(i);
        }
        return hash % hash_value;
    }

    // 存入
    function map_set(key, value) {
        var index = hash(key);
        if (answer_question_map[index] === undefined) {
            answer_question_map[index] = [
                [key, value]
            ];
        } else {
            for (var i = 0; i < answer_question_map[index].length; i++) {
                if (answer_question_map[index][i][0] == key) {
                    return null;
                }
            }
            answer_question_map[index].push([key, value]);
        }
    };

    // 取出
    function map_get(key) {
        var index = hash(key);
        if (answer_question_map[index] != undefined) {
            for (var i = 0; i < answer_question_map[index].length; i++) {
                if (answer_question_map[index][i][0] == key) {
                    return answer_question_map[index][i][1];
                }
            }
        }
        return null;
    };

    /**
   * 通过Http下载题库到本地，并进行处理，如果本地已经存在则无需下载
   */

    // 使用McMug2020题库
    var answer_question_bank = http.get('https://gitcode.net/McMug2020/XXQG_TiKu/-/raw/master/%E9%A2%98%E5%BA%93_McMug2020.json')
    // 如果资源过期换成别的云盘
    if (!(answer_question_bank.statusCode >= 200 && answer_question_bank.statusCode < 300)) {
        // 使用腾讯云
        var answer_question_bank = http.get('https://xxqg-tiku-1305531293.cos.ap-nanjing.myqcloud.com/%E9%A2%98%E5%BA%93_%E6%8E%92%E5%BA%8F%E7%89%88.json')
    }
    answer_question_bank = answer_question_bank.body.string();
    answer_question_bank = JSON.parse(answer_question_bank);

    for (var question in answer_question_bank) {
        var answer = answer_question_bank[question];
        if (vague_words.indexOf(question.slice(0, 7)) != -1) question = question.slice(question.indexOf('|') + 1);
        else {
            question = question.slice(0, question.indexOf('|'));
            question = question.slice(0, question.indexOf(' '));
            question = question.slice(0, 25);
        }
        map_set(question, answer);
    }

    var count = 0;
    for (var i in answer_question_map) {
        if (answer_question_map[i] != null) count++;
    }
    //   log('哈希表利用率 = ' + (count / answer_question_map.length).toString());
    if (max_utilization < count / answer_question_map.length) {
        max_utilization = count / answer_question_map.length
        max_utilization_i = hash_value
    }

    /* 评估哈希表每个index占多少个元素的最大值和平均值 */
    var count = 0;
    var max_value = 0;
    var avg_value = 0;
    var max_i = 0;
    for (var i = 0; i < answer_question_map.length; i++) {
        if (answer_question_map[i] != null) {
            count++;
            if (answer_question_map[i].length > max_value) {
                max_value = answer_question_map[i].length;
                max_i = i;
            }
            avg_value = avg_value + answer_question_map[i].length;
        }
    }
    avg_value = avg_value / count;
    if (min_avg_value > avg_value) {
        min_avg_value = avg_value
        min_avg_value_i = hash_value
    }
    if (min_max_value > max_value) {
        min_max_value = max_value
        min_max_value_i = hash_value
    }


    //   log('最大值 = ' + max_value.toString());
    //   log('平均值 = ' + avg_value.toString());
    //   log(answer_question_map[max_i]);

}

log('最优利用率 = ' + max_utilization.toString());
log('最优利用率的哈希值为 = ' + max_utilization_i.toString());
log('最小平均值 = ' + min_avg_value.toString());
log('最小平均值的哈希值为 = ' + min_avg_value_i.toString());
log('最小最大值 = ' + min_max_value.toString());
log('最小最大值的哈希值为 = ' + min_max_value_i.toString());

// 取消屏幕唤醒
device.cancelKeepingAwake();
// 震动半秒
device.vibrate(500);
toast("脚本运行完成");
exit();
