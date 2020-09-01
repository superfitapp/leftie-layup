import $ from 'jquery'
import Swiper, { Pagination, EffectFade, Autoplay } from 'swiper'

$(document).ready(() => {
  const $featuredSliderContainer = $('.js-featured-slider')
  const $featuredSlides = $('.js-featured-slide')

  if ($featuredSliderContainer.length > 0) {
    Swiper.use([Pagination, EffectFade, Autoplay])

    let autoplay = {
      delay: 5000
    }
    let pagination = false
    let grabCursor = false

    if (
      typeof disableFeaturedSliderAutoplay !== 'undefined' && disableFeaturedSliderAutoplay
    ) {
      autoplay = false
    }

    if ($featuredSlides.length > 1) {
      pagination = {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      }

      grabCursor = true
    }

    const featuredSwiper = new Swiper('.js-featured-slider', {
      autoHeight: true,
      autoplay: autoplay,
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      grabCursor: grabCursor,
      longSwipesRatio: 0.1,
      pagination: pagination,
      a11y: true,
      on: {
        init: function() {
          $featuredSliderContainer.addClass('loaded')
          setTimeout(() => {
            this.slideTo(0, 0)
          }, 100)
        }
      }
    })

    if (
      typeof disableFeaturedSliderAutoplay === 'undefined' || !disableFeaturedSliderAutoplay
    ) {
      $featuredSliderContainer.hover(() => {
        featuredSwiper.autoplay.stop()
      }, () => {
        featuredSwiper.autoplay.start()
      })
    }
  }
})
