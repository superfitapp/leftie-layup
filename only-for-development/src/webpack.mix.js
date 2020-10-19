let mix = require('laravel-mix');

mix.webpackConfig({
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: Config.babel()
          }
        ]
      }
    ]
  }
});

mix.js('js/helpers.js', 'js/')
  .js('js/app.js', 'js/')
  .js('js/home.js', 'js/')
  .js('js/post.js', 'js/')
  .js('js/account.js', 'js/')
  .extract()
  .setResourceRoot('/assets')
  .setPublicPath('../assets')
  .sass('sass/app.scss', 'css/')
  .sass('sass/home.scss', 'css/')
  .sass('sass/listing.scss', 'css/')
  .sass('sass/post.scss', 'css/')
  .sass('sass/author.scss', 'css/')
  .sass('sass/newsletter.scss', 'css/')
  .sass('sass/tags.scss', 'css/')
  .sass('sass/404.scss', 'css/')
  .sass('sass/auth.scss', 'css/')
  .sass('sass/membership.scss', 'css/')
  .sass('sass/account.scss', 'css/')
  .options({
    processCssUrls: false
  })
  .copy('sass/fonts/icomoon/*.*', '../assets/fonts/icomoon/')
  .copyDirectory('sass/fonts/inter/', '../assets/fonts/inter/')
  .copy('js/vendor/content-api.min.js', '../assets/js/vendor/')
  .browserSync({
    proxy: "localhost:2368",
    files: [
      'js/**/*.js',
      'sass/**/*.scss',
      '../**/*.hbs'
    ]
  });
  