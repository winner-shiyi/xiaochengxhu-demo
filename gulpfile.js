const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const del = require('del');
const runSequence = require('run-sequence');
const inquirer = require('inquirer');
const generatePage = require('./genpage');
const rmpage = require('./rmpage');

// load all gulp plugins
const plugins = gulpLoadPlugins();
const env = process.env.NODE_ENV || 'development';
const isProduction = () => env === 'production';

// utils functions
function generateFile (options) {
  const files = generatePage({
    root: path.resolve(__dirname, './src/pages/'),
    name: options.pageName,
    scss: options.styleType === 'scss',
    less: options.styleType === 'less',
    json: options.needConfig
  });
  files.forEach && files.forEach(file => plugins.util.log('[generate]', file));
  return files;
}

function generateJson (options) {
  const filename = path.resolve(__dirname, 'src/app.json');
  const now = fs.readFileSync(filename, 'utf8');
  const temp = now.split('\n    // Dont remove this comment');
  if (temp.length !== 2) {
    return plugins.util.log('[generate]', 'Append json failed');
  }
  const result = `${temp[0].trim()},
    "pages/${options.pageName}/${options.pageName}"
    // Dont remove this comment
  ${temp[1].trim()}
`;
  fs.writeFileSync(filename, result);
}

/**
 * Clean distribution directory
 */
gulp.task('clean', del.bind(null, ['dist/*']));

/**
 * Lint source code
 */
gulp.task('lint', () => {
  return gulp.src(['*.{js,json}', '**/*.{js,json}', '!node_modules/**', '!dist/**', '!src/utils/**', '!src/libs/**'])
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format('node_modules/eslint-friendly-formatter'))
    .pipe(plugins.eslint.failAfterError());
});

/**
 * Compile js source to distribution directory
 */
gulp.task('compile:js', () => {
  return gulp.src(['src/**/*.js'])
    // .pipe(plugins.sourcemaps.init())
    .pipe(plugins.babel())
    .pipe(plugins.if(isProduction, plugins.uglify()))
    // .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

/**
 * Compile xml source to distribution directory
 */
gulp.task('compile:xml', () => {
  return gulp.src(['src/**/*.xml'])
    // .pipe(plugins.sourcemaps.init())
    .pipe(plugins.if(isProduction, plugins.htmlmin({
      collapseWhitespace: true,
      // collapseBooleanAttributes: true,
      // removeAttributeQuotes: true,
      caseSensitive: true,
      keepClosingSlash: true, // xml
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(plugins.rename({ extname: '.wxml' }))
    // .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

/**
 * Compile sass source to distribution directory
 */
gulp.task('compile:sass', () => {
  return gulp.src(['src/**/*.scss'])
    // .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass())
    .pipe(plugins.if(isProduction, plugins.cssnano({ compatibility: '*' })))
    .pipe(plugins.rename({ extname: '.wxss' }))
    // .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

/**
 * Compile wxss source to distribution directory
 */
gulp.task('compile:wxss', () => {
  console.log('compile:wxss');
  return gulp.src(['src/**/*.wxss'])
    .pipe(gulp.dest('dist'));
});

/**
 * Compile wxml source to distribution directory
 */
gulp.task('compile:wxml', () => {
  console.log('compile:wxml');
  return gulp.src(['src/**/*.wxml'])
    .pipe(gulp.dest('dist'));
});

/**
 * Compile json source to distribution directory
 */
gulp.task('compile:json', () => {
  return gulp.src(['src/**/*.json'])
    // .pipe(plugins.sourcemaps.init())
    .pipe(plugins.jsonminify())
    // .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

/**
 * Compile img source to distribution directory
 */
gulp.task('compile:img', () => {
  return gulp.src(['src/**/*.{jpg,jpeg,png,gif}'])
    .pipe(plugins.imagemin())
    .pipe(gulp.dest('dist'));
});

/**
 * Compile source to distribution directory
 */
gulp.task('compile', ['clean'], next => {
  runSequence([
    'compile:js',
    'compile:xml',
    'compile:wxml',
    'compile:wxss',
    'compile:sass',
    'compile:json',
    'compile:img'
  ], next);
});

/**
 * Copy extras to distribution directory
 */
gulp.task('extras', [], () => {
  return gulp.src([
    'src/**/*.*',
    '!src/**/*.js',
    '!src/**/*.xml',
    '!src/**/*.wxml',
    '!src/**/*.wxss',
    '!src/**/*.sass',
    '!src/**/*.json',
    '!src/**/*.{jpe?g,png,gif}'
  ])
  .pipe(gulp.dest('dist'));
});

/**
 * Build
 */
gulp.task('build', next => runSequence(['compile', 'extras'], next));
// gulp.task('build', ['lint'], next => runSequence(['compile', 'extras'], next));

/**
 * Watch source change
 */
gulp.task('watch', ['build'], () => {
  gulp.watch('src/**/*.js', ['compile:js']);
  gulp.watch('src/**/*.xml', ['compile:xml']);
  gulp.watch('src/**/*.wxml', ['build']);
  gulp.watch('src/**/*.wxss', ['build']);
  gulp.watch('src/**/*.scss', ['compile:sass']);
  gulp.watch('src/**/*.json', ['compile:json']);
  gulp.watch('src/**/*.{jpe?g,png,gif}', ['compile:img']);
});

/**
 * Generate new page
 */
gulp.task('generate', next => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'pageName',
      message: 'Input the page name',
      default: 'index'
    },
    {
      type: 'confirm',
      name: 'needConfig',
      message: 'Do you need a configuration file',
      default: true
    },
    {
      type: 'list',
      name: 'styleType',
      message: 'Select a style framework',
      // choices: ['less', 'scss', 'css'],
      choices: ['scss'],
      default: 'scss'
    }
  ])
  .then(options => {
    const res = generateFile(options);
    if (res) generateJson(options);
    runSequence(['build']);
  })
  .catch(err => {
    throw new plugins.util.PluginError('generate', err);
  });
});

/**
 * rmapge page
 */
gulp.task('rmpage', next => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'pageName',
      message: 'Input the page name',
      default: ''
    }
  ])
  .then(options => {
    rmpage(options);
    runSequence(['build']);
  })
  .catch(err => {
    throw new plugins.util.PluginError('rmapge', err);
  });
});

/**
 * Default task
 */
gulp.task('default', ['watch']);
