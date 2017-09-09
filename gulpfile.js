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

// Development Tasks
// -----------------

// Start browserSync server
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'dev'
    }
  })
});

gulp.task('sass', function() {
  return gulp.src('src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dev/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Składa html'a z bloków i pluje do katalogu ./dev
gulp.task('htmlIncludes', function() {
  gulp.src('src/html/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(htmlbeautify({
      indentSize: 2
    }))
    .pipe(gulp.dest('./dev'));
});

// Składa js'a z bloków i pluje do katalogu ./dev/js
gulp.task('jsIncludes', function() {
  gulp.src('src/js/*.js')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./dev/js'));
});

// (TYLKO!) Kopiuje zewnętrzne/inne biblioteki/js'y do katalogu ./dev/js/ext-libs
gulp.task('devCopyExternalJsLibs', function() {
  return gulp.src('src/js/ext-libs/**/*')
  .pipe(gulp.dest('./dev/js/ext-libs'));
});

gulp.task('devCopyFonts', function() {
  return gulp.src('src/fonts/**/*')
  .pipe(gulp.dest('./dev/fonts'));
});

gulp.task('devCopyImages', function() {
  return gulp.src('src/images/**/*')
  .pipe(gulp.dest('./dev/images'));
});

// Watchers

gulp.task('watch', function() {
  gulp.watch('src/html/*.html', ['htmlIncludes']);
  gulp.watch('src/scss/**/*.scss', ['sass']);
  gulp.watch('src/js/*.js', ['jsIncludes']);

  gulp.watch('src/html/*.html', browserSync.reload);
  gulp.watch('src/js/*.js', browserSync.reload);
});

// Optimization Tasks
// ------------------

// gulp.task('htmlbeautify', function() {
//   var options = {
//     indentSize: 2
//   };
//   gulp.src('dev/*.html')
//     .pipe(htmlbeautify(options))
//     .pipe(gulp.dest('dist'))
// });

// Optimizing CSS and JavaScript
gulp.task('useref', function() {

  return gulp.src('dev/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'));
});

// Optimizing Images
gulp.task('images', function() {
  return gulp.src('dev/images/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
    .pipe(cache(imagemin({
      interlaced: true,
    })))
    .pipe(gulp.dest('dist/images'))
});

// Copying fonts
gulp.task('fonts', function() {
  return gulp.src('dev/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
});

// Cleaning
gulp.task('clean', function() {
  return del.sync('dist').then(function(cb) {
    return cache.clearAll(cb);
  });
});

gulp.task('clean:dist', function() {
  return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

// Build Sequences
// ---------------

gulp.task('default', function(callback) {
  runSequence(
    [
      'htmlIncludes',
      'jsIncludes',
      'devCopyExternalJsLibs',
      'devCopyFonts',
      'devCopyImages',
      'sass',
      'browserSync'
    ],
    'watch',
    callback
  )
});

gulp.task('build', function(callback) {
  runSequence(
    'clean:dist',
    'sass',
    ['useref', 'images', 'fonts'],
    callback
  )
});
