var execSync = require('child_process').execSync;
var fs = require('fs');
var path = require('path');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();

module.exports = function rmPage (page) {
  console.log('========================');
  console.log('========================');
  console.log('========================');
  console.log(page);

  var targetPath = path.join(__dirname, 'src/pages/' + page.pageName);
  console.log(targetPath);
  console.log(fs.existsSync(targetPath));
  rmJson(page.pageName);
  if (fs.existsSync(targetPath)) {
    // fs.mkdirSync(prebuildPath);
    console.log(targetPath);
    var cmd = 'rm -rf ' + targetPath;
    execSync(cmd);
    rmJson(page.pageName);
  }
};

function rmJson (pageName) {
  const filename = path.resolve(__dirname, 'src/app.json');
  const now = fs.readFileSync(filename, 'utf8');
  const targetpage = `"pages/${pageName}/${pageName}",\n`;
  const otherTargetpage = `"pages/${pageName}/${pageName}"`;
  const temp = now.split('\n    // Dont remove this comment');
  console.log('+++++++++++++++++++++++++');
  console.log('+++++++++++++++++++++++++');
  console.log('+++++++++++++++++++++++++');
  console.log(temp);
  console.log('+++++++++++++++++++++++++');
  console.log('+++++++++++++++++++++++++');
  console.log('+++++++++++++++++++++++++');
  console.log(Array.isArray(temp));
  if (temp.length !== 2) {
    return plugins.util.log('[rmpage]', 'rm json failed');
  }

  if (temp[0].trim().search(targetpage) !== -1) {
    console.log('有逗号');
    const result = `${temp[0].trim().replace(targetpage, '')}
    // Dont remove this comment
  ${temp[1].trim()}
  `;
    fs.writeFileSync(filename, result);
    return;
  }
  if (temp[0].trim().search(otherTargetpage) !== -1) {
    console.log('没逗号');
    const result = `${temp[0].trim().replace(otherTargetpage, '')}
    // Dont remove this comment
  ${temp[1].trim()}
  `;
    fs.writeFileSync(filename, result);
  }
};
