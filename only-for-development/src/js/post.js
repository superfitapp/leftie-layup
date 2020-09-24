import $ from 'jquery'
import mediumZoom from 'medium-zoom'
import fitvids from 'fitvids'
import stickybits from 'stickybits'
import tippy from 'tippy.js'
import Swiper from 'swiper'
import { isMobile, makeImagesZoomable } from './helpers'

let $article = null
let $header = null
let $progressBar = null
let $scrollToTop = null
let lastScrollingY = window.pageYOffset
let lastWindowHeight = 0
let lastArticleHeight = 0
let isTicking = false

const onScrolling = () => {
  lastScrollingY = window.pageYOffset
  requestTicking()

  if ($scrollToTop && lastScrollingY > $scrollToTop.height()) {
    $scrollToTop.addClass('visible')
  } else {
    $scrollToTop.removeClass('visible')
  }
}

const onResizing = () => {
  setHeights()

  setTimeout(() => {
    requestTicking()
  }, 200)
}

const requestTicking = () => {
  if (!isTicking) {
    requestAnimationFrame(updatingProgress)
  }

  isTicking = true
}

const updatingProgress = () => {
  const progressMax = lastArticleHeight - lastWindowHeight
  const percent = Math.ceil((lastScrollingY / progressMax) * 100)

  if (percent <= 100) {
    setProgress(percent)
  } else {
    setProgress(100)
  }

  isTicking = false
}

const setHeights = () => {
  lastWindowHeight = window.innerHeight
  lastArticleHeight = $article.height() + $header.height()
}

const setProgress = (percent) => {
  if (percent <= 100) {
    $progressBar.css('width', `${percent}%`)
  }
}

$(document).ready(() => {
  const $copyLink = $('.js-copy-link')
  const $inputLink = $('.js-input-link')
  const $relatedSliderContainer = $('.js-related-slider')

  fitvids('.m-article-content')

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

  $('.m-article-content').find('figure img').each(function () {
    if (
      !$(this).closest('figure').hasClass('kg-bookmark-card') &&
      !$(this).parent().is('a')
    ) {
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
      a11y: true,
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

  makeImagesZoomable($, mediumZoom)

  window.addEventListener('scroll', onScrolling, { passive: true })
  window.addEventListener('resize', onResizing, { passive: true })
})

$(window).on('load', () => {
  $header = $('.js-header')
  $article = $('.js-article')
  $progressBar = $('.js-progress-bar')
  $scrollToTop = $('.js-scroll-top')
  lastScrollingY = window.pageYOffset

  $scrollToTop.click(() => {
    $('html, body').animate({
      scrollTop: 0
    }, 500)
  })

  setHeights()
  updatingProgress()
})
