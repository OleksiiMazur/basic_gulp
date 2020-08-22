let distFolder = "dist";
let srcFolder = "src";

let path = {
    build: {
        html: distFolder + "/",
        css: distFolder  + "/css/",
        js: distFolder   + "/js/",
        img: distFolder  + "/img/",
        fonts: distFolder  + "/fonts/",
    },
    src: {
        html: srcFolder + "/*.html",
        css: srcFolder  + "/scss/**/*scss",
        js: srcFolder   + "/js/**/*.js",
        img: srcFolder  + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: srcFolder  + "/fonts/**/*.ttf",
    },
    watch: {
        html: srcFolder   + "/**/*.html",
        css: srcFolder    + "/scss/**/*.scss",
        js: srcFolder     + "/js/**/*.js",
        img: srcFolder    + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: srcFolder  + "/fonts/**/*.ttf",
    },
    clean: "./" + distFolder + "/",
};

let { src, dest } = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    del = require("del"),
    scss = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    clean_css = require("gulp-clean-css"),
    group_media = require("gulp-group-css-media-queries"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default,
    babel = require("gulp-babel"),
    imgmin = require("gulp-imagemin"),
    ttf2woff = require("gulp-ttf2woff"),
    ttf2woff2 = require("gulp-ttf2woff2"),
    ttf2svg = require("gulp-ttf-svg"),
    ttf2eot = require("gulp-ttf2eot");

function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + distFolder + "/",
        },
        port: 3000,
        notify: false,
    });
}

function html() {
    return src(path.src.html)
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}

function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: 'expanded',
            })
        )
        .pipe(group_media())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true,
            })
        )
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
}

function js() {
    return src(path.src.js)
        .pipe(babel())
        .pipe(dest(path.build.js))

        .pipe(uglify())
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}

function imgs() {
    return src(path.src.img)
        .pipe(
            imgmin({
                progressive: true,
                svgoPlugins: [{ removeVieBox: false }],
                interlaced: true,
                optimizationLevel: 4,
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream());
}

function fonts() {
    src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
    src(path.src.fonts)
        .pipe(ttf2svg())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2eot())
        .pipe(dest(path.build.fonts));
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], imgs);
    gulp.watch([path.watch.fonts], fonts);
}

function clean(params) {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, imgs, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.imgs = imgs;
exports.html = html;
exports.css = css;
exports.js = js;
exports.build = build;
exports.watch = watch;
exports.default = watch;