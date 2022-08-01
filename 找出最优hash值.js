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
var hash_value_list = [5623,5639,5641,5647,5651,5653,5657,5659,5669,5683,5689,5693,5701,5711,5717,5737,5741,5743,5749,5779,5783,5791,5801,5807,5813,5821,5827,5839,5843,5849,5851,5857,5861,5867,5869,5879,5881,5897,5903,5923,5927,5939,5953,5981,5987,6007,6011,6029,6037,6043,6047,6053,6067,6073,6079,6089,6091,6101,6113,6121,6131,6133,6143,6151,6163,6173,6197,6199,6203,6211,6217,6221,6229,6247,6257,6263,6269,6271,6277,6287,6299,6301,6311,6317,6323,6329,6337,6343,6353,6359,6361,6367,6373,6379,6389,6397,6421,6427,6449,6451,6469,6473,6481,6491,6521,6529,6547,6551];
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
    var answer_question_bank = http.get('https://git.yumenaka.net/https://raw.githubusercontent.com/McMug2020/XXQG_TiKu/main/%E9%A2%98%E5%BA%93_McMug2020.json')
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