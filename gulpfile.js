const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));

// Compilar Sass
function compilarSass() {
  return src('assets/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('assets/css'));
}

// Vigilar archivos
function verArchivos() {
  watch('assets/sass/**/*.scss', compilarSass);
}

// Tareas
exports.default = series(compilarSass, verArchivos);
