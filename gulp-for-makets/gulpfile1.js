// [ БАЗОВІ НАЛАШТУВАННЯ ]
var gulp = require('gulp'), //Відповідно сам gulp
    concat = require('gulp-concat'), //Обєднання файлів
    rename = require("gulp-rename"), //Перейменування файлів
    sourcemaps = require('gulp-sourcemaps'), //Робота з переліком файлів
    watch = require('gulp-watch'); //Наглядачі

//Сервер для розробки
var cached = require('gulp-cached'); //Кешування файлів для прискорення обробки в память
remember = require('gulp-remember'); //
connect = require('gulp-connect'); //Livereload Server

// [ ОБРОБКА ]
// [ LESS ]
var less = require('gulp-less'); //Підключення LESS
// [ SASS ]
var compass = require('gulp-compass'); //Підключення COMPAS
scss = require('gulp-sass'); //Підключення SASS

//Вихідна обобка файлів CSS, JS
var uglify = require('gulp-uglify'), //Архівація JS файлів
    minifyCss = require('gulp-minify-css'); //Архівація CSS файлів
cssBase64 = require('gulp-css-base64'); //transform all resources found in a CSS into base64-encoded data URI strings
//You can ignore a resource with a comment /*base64:skip*/ in CSS file after url definition.

var gulpif = require('gulp-if');
//var sprite = require('css-sprite').stream;
var sprite = require('gulp-sprite-generator');

//Вихідна обобка файлів JPG, PNG
var imagemin = require('gulp-imagemin'), //Обробка зображень
    imagePngquant = require('imagemin-pngquant'), //Обробка зображень формату PNG
    imageminJpegtran = require('imagemin-jpegtran'), //Обробка зображень формату JPG
    imageSvgo = require('imagemin-svgo'); //Обробка зображень формату SVG
imageResize = require('gulp-image-resize'); //

// [ ТЕСТУВАННЯ ]
//Перевірка коду
var jshint = require('gulp-jshint'); //Перевірка JS
stylish = require('jshint-stylish'); //Stylish
//cssLint = require('gulp-csslint'); //Перевірка CSS
scssLint = require('gulp-scss-lint'); //Перевірка SCSS
//gem install scss-lint  !!ОБОВЯЗКОВО


//source
var dev_paths = {
    'js': ['./build/js/*'],
    'less': ['./build/less/**/*.less'],
    'scss': ['./build/scss/**/*.scss'],
    'css': ['./build/css/main.scss.css'],
    'css-base': './build/css/',
    'images-jpg': ['./build/img/**/*.jpg', './build/img/*.jpg'],
    'images-svg': ['./build/img/**/*.svg'],
    'images-png': ['./build/img/**/*.png'],
    'images': ['./build/img/**/*'],
    'images-css': ['./build/imgcss']
};
//destination
var build_paths = {
    'images': './public/img/',
    'js': './public/js/',
    'css': './public/css/'
};

// [ ЗАВДАННЯ ТЕСТОВІ ]
//------------------------------------------------------------------------

//------------------------------------------------------------------------

// [ ПРОГРАМА ]
// [ НАЛАШТУВАННЯ SERVER ]
// Rerun the task when a file changes 
gulp.task('watch', function () {
    gulp.watch(dev_paths['js'], ['scripts']);
    gulp.watch(dev_paths['images'], ['images']);
    gulp.watch(dev_paths['css'], ['minify-css']);
    gulp.watch(dev_paths['scss'], ['scss']);
    gulp.watch(dev_paths['less'], ['less']);
});

// The default task (called when you run `gulp` from cli) 
gulp.task('default', ['watch', 'scss', 'less', 'scripts', 'images', 'minify-css', 'base64']);
//'webserver', 'livereload'
//------------------------------------------------------------------------
//------------------------------------------------------------------------

// generate sprite.png and _sprite.scss
//gulp.task('sprites', function () {
//    return gulp.src('./build/imgsprite/*.png')
//        .pipe(sprite({
//            name: 'sprite',
//            style: '_sprite.scss',
//            cssPath: './img',
//            //processor: 'scss'
//        }))
//        .pipe(gulpif('*.png', gulp.dest('./build/img/'), gulp.dest('./build/css/')))
//});
//
gulp.task('sprites', function () {
    var spriteOutput;

    spriteOutput = gulp.src("./build/css/*.css")
        .pipe(sprite({
            //baseUrl: "./build",
            spriteSheetName: "sprite.png",
            spriteSheetPath: "../img"
        }));

    spriteOutput.css.pipe(gulp.dest("./build/css1"));
    spriteOutput.img.pipe(gulp.dest("./build/img"));
});

// [ ЗАВДАННЯ ]
//------------------------------------------------------------------------

// [ НАЛАШТУВАННЯ SERVER ]
//gulp.task('webserver', function () {
//    connect.server({
//        port: 8088,
//        livereload: true
//    });
//});
//
//gulp.task('livereload', function () {
//    gulp.src(['./**/*'])
//            .pipe(connect.reload());
//});
//------------------------------------------------------------------------

// [ ОБРОБКА COMPASS ]
gulp.task('compass', function () {
    gulp.src(dev_paths['scss'])
        // .pipe(plumber({
        //   errorHandler: function (error) {
        //     console.log(error.message);
        //     this.emit('end');
        // }}))
        .pipe(compass({
            css: dev_paths['css-base'],
            sass: 'scss',
            image: 'images'
        }))
        .on('error', console.log)
        .pipe(gulp.dest(dev_paths['css-base']))
        .pipe(minifyCss())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(build_paths['css']));
});

//------------------------------------------------------------------------

// [ ОБРОБКА LESS ]
gulp.task('less', function () {
    return gulp.src(dev_paths['less'])
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(sourcemaps.write())
        .pipe(rename({suffix: '.less'}))
        .pipe(gulp.dest(dev_paths['css-base']));
});

//------------------------------------------------------------------------

// [ ОБРОБКА SASS ]
//['lintSCSS']
gulp.task('scss', function () {
    return gulp.src(dev_paths['scss'])
        .pipe(sourcemaps.init())
        .pipe(scss())
        .pipe(sourcemaps.write())
        .pipe(rename({suffix: '.scss'}))
        .pipe(gulp.dest(dev_paths['css-base']));
});

// [ ПЕРЕВІРКА КОДУ SCSS ]
gulp.task('lintSCSS', function () {
    return gulp.src(dev_paths['scss'])
        .pipe(cached('lintingCSS'))
        .on('error', console.log)
        .pipe(scssLint({
            // 'maxBuffer': 307200
        }));
});
//------------------------------------------------------------------------

// [ ОБРОБКА CSS ]
//Мінімізація CSS файлів
gulp.task('minify-css', function () {
    return gulp.src(dev_paths['css'])
        .pipe(cssBase64())
        .pipe(rename({
            'suffix': '.min'
        }))
        .pipe(minifyCss())
        .on('error', console.log)
        .pipe(gulp.dest(build_paths['css']))
        .pipe(connect.reload());
});

// [ ПЕРЕВІРКА КОДУ CSS ]
gulp.task('lintCSS', function () {
    return gulp.src(dev_paths['css'])
        .pipe(cached('lintingCSS'))
        .pipe(cssLint())
        .on('error', console.log)
        // .pipe(jshint.reporter('default'));
        .pipe(cssLint.reporter('jshint-stylish'));
});

//------------------------------------------------------------------------

// [ ОБРОБКА JS ]
// [ COMMON JS TASK ]
gulp.task('scripts', ['minify-js', 'lintJS'], function () {
    return gulp.src(dev_paths['js'])
        .pipe(remember('lintingJS'))
        .pipe(concat('core.js'))
        .on('error', console.log)
        .pipe(gulp.dest(build_paths['js']));
});

// [ МІНІФІКАЦІЯ JS ]
gulp.task('minify-js', function () {
    return gulp.src(build_paths['scripts'] + 'core.js')
        .pipe(rename(build_paths['scripts'] + 'core.min.js'))
        .pipe(uglify())
        .on('error', console.log)
        .pipe(gulp.dest('.'));
});

// [ ПЕРЕВІРКА КОДУ JS ]
gulp.task('lintJS', function () {
    return gulp.src(dev_paths['js'])
        .pipe(cached('lintingJS'))
        .pipe(jshint())
        // .pipe(jshint.reporter('default'));
        .pipe(jshint.reporter('jshint-stylish'));
});
//------------------------------------------------------------------------

// [ ОБРОБКА ЗОБРАЖЕНЬ ]
gulp.task('images', ['image-jpg', 'image-png', 'image-svg']);

// [ ОБРОБКА JPG ]
gulp.task('image-jpg', function () {
    return gulp.src(dev_paths['images-jpg'])
        // .pipe(imageminJpegtran({progressive: true})())
        // .on('error', console.log)
        .pipe(gulp.dest(build_paths['images']));
});

// [ ОБРОБКА PNG ]
gulp.task('image-png', function () {
    return gulp.src(dev_paths['images-png'])
        .pipe(imagemin({
            use: [imagePngquant()]
        }))
        .on('error', console.log)
        .pipe(gulp.dest(build_paths['images']));
});

// [ ОБРОБКА SVG ]
gulp.task('image-svg', function () {
    return gulp.src(dev_paths['images-svg'])
        .pipe(imagemin({
            svgoPlugins: [{removeViewBox: false}],
        }))
        .on('error', console.log)
        .pipe(gulp.dest(build_paths['images']));
});
//------------------------------------------------------------------------

// [ ПЕРЕВІРКА КОДУ ]

// [ ПЕРЕВІРКА КОДУ HTML ]
gulp.task('lintHTML', function () {
    return gulp.src('./src/*.html')
        .pipe(cache('lintingHTML'))
        // if flag is not defined default value is 'auto'
        .pipe(jshint.extract('auto|always|never'))
        .pipe(jshint())
        // .pipe(jshint.reporter('default'));
        .pipe(jshint.reporter('jshint-stylish'));
});

//------------------------------------------------------------------------