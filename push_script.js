import axios from 'axios';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// Server酱的KEY，从环境变量获取
const SCKEY = process.env.SCKEY || '';

// 要获取的热搜平台
const platforms = [
  { name: '微博', url: 'http://localhost:6688/weibo' },
  { name: '百度', url: 'http://localhost:6688/baidu' },
  { name: '哔哩哔哩', url: 'http://localhost:6688/bilibili' },
  { name: '知乎', url: 'http://localhost:6688/zhihu' },
  { name: '抖音', url: 'http://localhost:6688/douyin' }
];

// 推送消息到Server酱
async function pushToServerChan(title, content) {
  try {
    const response = await axios.post(
      `https://sctapi.ftqq.com/${SCKEY}.send`,
      new URLSearchParams({
        title: title,
        desp: content
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log('推送成功:', response.data);
  } catch (error) {
    console.error('推送失败:', error);
  }
}

// 获取热搜数据
async function getHotSearchData(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('获取热搜数据失败:', error);
    return null;
  }
}

// 格式化热搜数据为Markdown
function formatHotSearchData(platform, data) {
  if (!data || !data.data || data.data.length === 0) {
    return `**${platform}**\n\n暂无热搜数据\n\n`;
  }

  let content = `**${platform}热搜榜**\n\n`;
  data.data.slice(0, 10).forEach((item, index) => {
    content += `${index + 1}. [${item.title}](${item.url})\n\n`;
  });
  content += '\n';
  return content;
}

// 主函数
async function main() {

  console.log('开始获取热搜数据...');
  
  let allContent = '';
  
  for (const platform of platforms) {
    console.log(`获取${platform.name}热搜数据...`);
    const data = await getHotSearchData(platform.url);
    if (data) {
      allContent += formatHotSearchData(platform.name, data);
    }
  }

  if (allContent) {
    const title = `热搜推送 - ${new Date().toLocaleString()}`;
    console.log('推送热搜数据到Server酱...');
    await pushToServerChan(title, allContent);
  } else {
    console.log('没有获取到热搜数据');
  }
}

// 运行主函数
main();
