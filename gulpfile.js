var browserSync = require('browser-sync');
var cache = require('gulp-cache');
var cssnano = require('gulp-cssnano');
var del = require('del');
var fileinclude = require('gulp-file-include');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var htmlbeautify = require('gulp-html-beautify');
var imagemin = require('gulp-imagemin');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');

gulp.task('htmlIncludes', function() {
  gulp.src('app/html/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(htmlbeautify({
      indent_size: 2
    }))
    .pipe(gulp.dest('dev'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('jsIncludes', function() {
  gulp.src('app/js/*.js')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('dev/js'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('devCopyExternalJsLibs', function() {
  return gulp.src('app/js/ext-libs/**/*')
  .pipe(gulp.dest('dev/js/ext-libs'));
});

gulp.task('devCopyFonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dev/fonts'));
});

gulp.task('devCopyImages', function() {
  return gulp.src('app/images/**/*')
  .pipe(gulp.dest('dev/images'));
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'dev'
    },
  })
})

gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('dev/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
})

gulp.task('watch', ['htmlIncludes', 'sass', 'jsIncludes', 'browserSync'], function() {
  gulp.watch('app/html/*.html', ['htmlIncludes']);
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/js/*.js', ['jsIncludes']);
})

gulp.task('useref', function() {

  return gulp.src('dev/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function() {
  return gulp.src('dev/images/**/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(cache(imagemin({
      interlaced: true,
    })))
    .pipe(gulp.dest('dist/images'))
});

gulp.task('fonts', function() {
  return gulp.src('dev/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
});

gulp.task('clean', function() {
  return del.sync('dist').then(function(cb) {
    return cache.clearAll(cb);
  });
});

gulp.task('clean:dist', function() {
  return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

gulp.task('build', function (callback) {
  runSequence('clean:dist',
    ['sass', 'useref', 'images', 'fonts'],
    callback
  )
})

gulp.task('default', function (callback) {
  runSequence(['htmlIncludes', 'jsIncludes', 'devCopyExternalJsLibs', 'devCopyFonts', 'devCopyImages', 'sass', 'browserSync', 'watch'],
    callback
  )
})
