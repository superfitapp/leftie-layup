import $ from 'jquery'
import mediumZoom from 'medium-zoom'
import fitvids from 'fitvids'
import stickybits from 'stickybits'
import tippy from 'tippy.js'
import Swiper from 'swiper'
import 'swiper/css/swiper.min.css'
import { isMobile } from './helpers'

$(document).ready(() => {
  const $copyLink = $('.js-copy-link')
  const $inputLink = $('.js-input-link')
  const $relatedSliderContainer= $('.js-related-slider')

  fitvids('.js-post-content')

  const adjustShare = () => {
    let $stickyShare = null

    if (!isMobile()) {
      $stickyShare = stickybits('.js-sticky', { stickyBitStickyOffset: 150 })
    } else {
      if ($stickyShare) {
        $stickyShare.cleanup()
      }
    }
  }

  const onResizing = () => {
    adjustShare()
  }

  const adjustImageGallery = () => {
    const images = document.querySelectorAll('.kg-gallery-image img')

    for (var i = 0, len = images.length; i < len; i++) {
      const container = images[i].closest('.kg-gallery-image')
      const width = images[i].attributes.width.value
      const height = images[i].attributes.height.value
      const ratio = width / height
      container.style.flex = `${ratio} 1 0%`
    }
  }

  adjustShare()
  adjustImageGallery()

  $('.js-post-content').find('figure img').each(function () {
    if (!$(this).closest('figure').hasClass('kg-bookmark-card')) {
      $(this).addClass('js-zoomable')
    }

    const $figcaption = $(this).parent().find('figcaption')
    if ($figcaption) {
      $(this).attr('alt', $figcaption.text())
    } else {
      $(this).attr('alt', '')
    }
  })

  tippy('.js-copy-tooltip', {
    trigger: 'click',
    arrow: true
  })

  $copyLink.click(() => {
    $inputLink[0].select()
    $inputLink[0].setSelectionRange(0, 99999)
    document.execCommand('copy')
    $inputLink.blur()
  })

  if ($relatedSliderContainer.length > 0) {
    const featuredSwiper = new Swiper('.js-related-slider', {
      slidesPerView: 'auto',
      spaceBetween: 20,
      slidesOffsetBefore: 20,
      slidesOffsetAfter: 20,
      freeMode: true,
      breakpoints: {
        768: {
          spaceBetween: 20,
          slidesOffsetBefore: 0,
          slidesOffsetAfter: 0,
          allowTouchMove: true
        },
        1280: {
          spaceBetween: 40,
          slidesOffsetBefore: 0,
          slidesOffsetAfter: 0,
          allowTouchMove: false
        },
        1440: {
          slidesPerView: 4,
          slidesOffsetBefore: 0,
          slidesOffsetAfter: 0,
          spaceBetween: 40,
          allowTouchMove: false
        }
      }
    })
  }

  mediumZoom('.js-zoomable')

  window.addEventListener('resize', onResizing, { passive: true })
})
