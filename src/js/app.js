import cssVars from 'css-vars-ponyfill'
import $ from 'jquery'
import lozad from 'lozad'
import Headroom from "headroom.js"
import AOS from 'aos'
import tippy from 'tippy.js'
import anime from 'animejs/lib/anime.es.js'
import Fuse from 'fuse.js'
import {
  isRTL,
  isMobile,
  isDarkMode,
  toggleScrollVertical,
  formatDate,
  getParameterByName
} from './helpers'

require('viewport-units-buggyfill').init()

cssVars({})

$(document).ready(() => {
  if (isRTL()) {
    $('html').attr('dir', 'rtl').addClass('rtl')
  }

  const $header = $('.js-header')
  const $openMenu = $('.js-open-menu')
  const $mobileTopbar = $('.js-mobile-topbar')
  const $mobileSubmenu = $('.js-mobile-submenu')
  const $openSearch = $('.js-open-search')
  const $closeSearch = $('.js-close-search')
  const $search = $('.js-search')
  const $inputSearch = $('.js-input-search')
  const $searchResults = $('.js-search-results')
  const $searchNoResults = $('.js-no-results')
  const $toggleDarkMode = $('.js-toggle-darkmode')
  const $openSecondaryMenu = $('.js-tooltip-secondary-menu')
  const $closeNotification = $('.js-notification-close')
  const $planPrice = $('.js-plan-price')
  const $desktopTopbarContent = $('.js-desktop-topbar-content')
  const $desktopTopbarNav = $('.js-desktop-topbar-nav')
  const currentSavedTheme = localStorage.getItem('theme')

  let fuse = null
  let secondaryMenuTippy = null

  const trySearchFeature = () => {
    if (typeof ghostSearchApiKey !== 'undefined') {
      getAllPosts(ghostHost, ghostSearchApiKey)
    } else {
      $openSearch.remove()
      $closeSearch.remove()
      $search.remove()
    }
  }

  const getAllPosts = (host, key) => {
    const api = new GhostContentAPI({
      url: host,
      key,
      version: 'v2'
    })
    const allPosts = []
    const fuseOptions = {
      shouldSort: true,
      threshold: 0,
      location: 0,
      distance: 100,
      tokenize: true,
      matchAllTokens: true,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['title', 'custom_excerpt', 'html']
    }

    api.posts.browse({
      limit: 'all',
      fields: 'id, title, url, published_at, custom_excerpt, html'
    })
      .then((posts) => {
        for (var i = 0, len = posts.length; i < len; i++) {
          allPosts.push(posts[i])
        }

        fuse = new Fuse(allPosts, fuseOptions)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const showNotification = (typeNotification) => {
    const $notification = $(`.js-alert[data-notification="${typeNotification}"]`)
    $notification.addClass('opened')
    setTimeout(() => {
      closeNotification($notification)
    }, 5000)
  }

  const closeNotification = ($notification) => {
    $notification.removeClass('opened')
    const url = window.location.toString()

    if (url.indexOf('?') > 0) {
      const cleanUrl = url.substring(0, url.indexOf('?'))
      window.history.replaceState({}, document.title, cleanUrl)
    }
  }

  const checkForActionParameter = () => {
    const action = getParameterByName('action')
    const stripe = getParameterByName('stripe')

    if (action === 'subscribe') {
      showNotification('subscribe')
    }

    if (action === 'signup') {
      window.location = `${ghostHost}/signup/?action=checkout`
    }

    if (action === 'checkout') {
      showNotification('signup')
    }

    if (action === 'signin') {
      showNotification('signin')
    }

    if (stripe === 'success') {
      showNotification('checkout')
    }
  }

  const toggleDesktopTopbarOverflow = (disableOverflow) => {
    if (!isMobile()) {
      if (disableOverflow) {
        $desktopTopbarContent.addClass('toggle-overflow')
        $desktopTopbarNav.addClass('toggle-overflow')
      } else {
        $desktopTopbarContent.removeClass('toggle-overflow')
        $desktopTopbarNav.removeClass('toggle-overflow')
      }
    }
  }

  $openMenu.click(() => {
    $header.toggleClass('opened')
    $openMenu.toggleClass('opened')
    $mobileTopbar.toggleClass('opened')
    $mobileSubmenu.toggleClass('opened')

    anime({
      targets: '.js-mobile-submenu .js-anime',
      translateY: [-25, 0],
      duration: 1000,
      delay: (target, index) => {
        return index * 25;
      },
      elasticity: 25
    })

    toggleScrollVertical()
  })

  $openSearch.click(() => {
    $search.addClass('opened')
    setTimeout(() => {
      $inputSearch.focus()
    }, 400);

    if (!isMobile()) {
      toggleScrollVertical()
    }
  })

  $closeSearch.click(() => {
    $inputSearch.blur()
    $search.removeClass('opened')

    if (!isMobile()) {
      toggleScrollVertical()
    }
  })

  $inputSearch.keyup(() => {
    if ($inputSearch.val().length > 0 && fuse) {
      const results = fuse.search($inputSearch.val())
      let htmlString = ''

      if (results.length > 0) {
        for (var i = 0, len = results.length; i < len; i++) {
          const lastClass = i === len - 1 ? 'last' : ''

          htmlString += `
          <article class="m-result ${lastClass}">\
            <a href="${results[i].url}" class="m-result__link">\
              <h3 class="m-result__title">${results[i].title}</h3>\
              <p class="m-result__meta">\
                <span>${formatDate(results[i].published_at)}</span>\
              </p>\
            </a>\
          </article>`
        }

        $searchNoResults.hide()
        $searchResults.html(htmlString)
        $searchResults.show()
      } else {
        $searchResults.html('')
        $searchResults.hide()
        $searchNoResults.show()
      }
    } else {
      $searchResults.html('')
      $searchResults.hide()
      $searchNoResults.hide()
    }
  })

  $toggleDarkMode.change(function() {
    if ($(this).is(':checked')) {
      $('html').attr('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      $('html').attr('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  })

  $toggleDarkMode.hover(() => {
    toggleDesktopTopbarOverflow(true)
  }, () => {
      toggleDesktopTopbarOverflow(false)
  })

  $closeNotification.click(function() {
    closeNotification($(this).parent())
  })

  if ($planPrice.length > 0) {
    $planPrice.each(function() {
      const planAmount = parseInt($(this).attr('data-plan-price')) / 100
      $(this).html(planAmount)
    })
  }

  $(document).keyup((e) => {
    if (e.key === 'Escape' && $search.hasClass('opened')) {
      $closeSearch.click()
    }
  })

  if (currentSavedTheme) {
    $('html').attr('data-theme', currentSavedTheme)

    if (currentSavedTheme === 'dark') {
      $toggleDarkMode.each(function () {
        $(this).attr('checked', true)
      })
    }
  } else {
    if (isDarkMode()) {
      $toggleDarkMode.each(function () {
        $(this).attr('checked', true)
      })
    }
  }

  if ($header.length > 0) {
    const headroom = new Headroom($header[0], {
      tolerance: {
        up: 10,
        down: 0
      },
      onUnpin: () => {
        if (!isMobile() && secondaryMenuTippy) {
          const desktopSecondaryMenuTippy = secondaryMenuTippy[1]

          if (
            desktopSecondaryMenuTippy && desktopSecondaryMenuTippy.state.isVisible
          ) {
            desktopSecondaryMenuTippy.hide()
          }
        }
      }
    })
    headroom.init()
  }

  const observer = lozad('.lozad', {
    loaded: (el) => {
      el.classList.add('loaded')
    }
  })
  observer.observe()

  if ($openSecondaryMenu.length > 0) {
    const template = document.getElementById('secondary-navigation-template')

    secondaryMenuTippy = tippy('.js-tooltip-secondary-menu', {
      content: template.innerHTML,
      arrow: true,
      trigger: 'click',
      interactive: true,
      onShow() {
        toggleDesktopTopbarOverflow(true)
      },
      onHidden() {
        toggleDesktopTopbarOverflow(false)
      }
    })
  }

  tippy('.js-tooltip', {
    arrow: true
  })

  if (typeof disableFadeAnimation === 'undefined' || !disableFadeAnimation) {
    AOS.init({
      once: true,
      startEvent: 'DOMContentLoaded',
    })
  } else {
    $('[data-aos]').addClass('no-aos-animation')
  }

  checkForActionParameter()
  trySearchFeature()
})
