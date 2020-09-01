import cssVars from 'css-vars-ponyfill'
import $ from 'jquery'
import lozad from 'lozad'
import Headroom from "headroom.js"
import AOS from 'aos'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import anime from 'animejs/lib/anime.es.js'
import Fuse from 'fuse.js/dist/fuse.basic.esm.min.js'
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
  const $mobileMenu = $('.js-mobile-menu')
  const $submenu = $('.js-submenu')
  const $toggleSubmenu = $('.js-toggle-submenu')
  const $closeSubmenu = $('.js-close-submenu')
  const $openSearch = $('.js-open-search')
  const $closeSearch = $('.js-close-search')
  const $search = $('.js-search')
  const $inputSearch = $('.js-input-search')
  const $searchInitState = $('.js-search-init-state')
  const $searchResultsContainer = $('.js-search-results-container')
  const $searchResults = $('.js-search-results')
  const $searchNoResults = $('.js-search-no-results')
  const $searchLoading = $('.js-search-loading')
  const $toggleDarkMode = $('.js-toggle-darkmode')
  const $openSecondaryMenu = $('.js-tooltip-secondary-menu')
  const $closeNotification = $('.js-notification-close')
  const $planPrice = $('.js-plan-price')
  const $desktopTopbarContent = $('.js-desktop-topbar-content')
  const $desktopTopbarNav = $('.js-desktop-topbar-nav')
  const currentSavedTheme = localStorage.getItem('theme')

  let observer = null
  let fuse = null
  let searchTimer = null
  let submenuIsOpen = false
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
      version: 'v3'
    })
    const allPosts = []
    const fuseOptions = {
      shouldSort: true,
      ignoreLocation: true,
      findAllMatches: true,
      includeScore: true,
      minMatchCharLength: 2,
      keys: ['title', 'custom_excerpt']
    }

    api.posts.browse({
      limit: 'all',
      fields: 'id, title, url, published_at, custom_excerpt, feature_image, visibility'
    })
      .then((posts) => {
        for (let i = 0, len = posts.length; i < len; i++) {
          allPosts.push(posts[i])
        }

        fuse = new Fuse(allPosts, fuseOptions)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const performSearch = () => {
    if (!isMobile()) {
      $searchInitState.hide()
    }

    const results = fuse.search($inputSearch.val())
    const bestResults = results.filter((result) => {
      if (result.score <= 0.5) {
        return result
      }
    })
    const visibilityTypes = {
      members: membersLabel,
      paid: paidLabel
    }
    let htmlString = ''

    if (bestResults.length > 0) {
      for (let i = 0, len = bestResults.length; i < len; i++) {
        const result = bestResults[i].item
        const lastClass = i === len - 1 ? 'last' : ''
        const resultImage = result.feature_image ?
          `<a href="${result.url}" class="m-result__image" aria-hidden="true" tabindex="-1">\
              <div class="lozad" data-background-image="${result.feature_image}"></div>\
            </a>` : ''

        htmlString += `
          <article class="m-result ${lastClass}">\
            ${resultImage}\
            <h3 class="m-result__title">\
              <a href="${result.url}">${result.title}</a>\
            </h3>\
            <div class="m-result__metas">\
              <span class="m-access-tag in-search-result ${result.visibility}" data-visibility="${visibilityTypes[result.visibility]}"></span>\
              <span class="m-result__date">${formatDate(result.published_at)}</span>\
            </div>\
          </article>`
      }

      $searchNoResults.hide()
      $searchResults.html(htmlString)
      $searchResultsContainer.show()
      observer.observe()
    } else {
      $searchResults.html('')
      $searchResultsContainer.hide()
      $searchNoResults.show()
    }
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

  const openSubmenu = () => {
    $toggleSubmenu.addClass('active')
    $submenu.addClass('opened')
  }

  const closeSubmenu = () => {
    submenuIsOpen = false
    $toggleSubmenu.removeClass('active')
    $submenu.removeClass('opened')
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
    $mobileMenu.toggleClass('opened')
    $submenu.removeClass('opened')

    if ($header.hasClass('opened')) {
      anime({
        targets: '.js-mobile-menu .js-anime',
        translateY: [-25, 0],
        duration: 1000,
        delay: (target, index) => {
          return index * 25
        },
        elasticity: 25
      })
    } else {
      closeSubmenu()
    }

    toggleScrollVertical()
  })

  $toggleSubmenu.click(() => {
    submenuIsOpen = !submenuIsOpen

    if (submenuIsOpen) {
      openSubmenu()
    } else {
      closeSubmenu()
    }
  })

  $closeSubmenu.click(() => {
    closeSubmenu()
  })

  $openSearch.click(() => {
    $search.addClass('opened')
    setTimeout(() => {
      if ($inputSearch.val().length === 0) {
        $inputSearch.focus()
      }
    }, 400)

    toggleScrollVertical()
  })

  $closeSearch.click(() => {
    $inputSearch.blur()
    $search.removeClass('opened')

    toggleScrollVertical()
  })

  $inputSearch.keyup(() => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }

    if ($inputSearch.val().length > 0 && fuse) {
      $searchLoading.show()

      searchTimer = setTimeout(() => {
        performSearch()
        $searchLoading.hide()
      }, 1000)
    } else {
      $searchLoading.hide()
      $searchResults.html('')
      $searchResultsContainer.hide()
      $searchNoResults.hide()

      if (!isMobile()) {
        $searchInitState.show()
      }
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

  $(document).click((e) => {
    if ($(e.target).hasClass('js-toggle-submenu') || $(e.target).parent().hasClass('js-toggle-submenu')) {
      return
    }

    if (!isMobile() && submenuIsOpen && !$submenu[0].contains(e.target)) {
      closeSubmenu()
    }
  })

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

  observer = lozad('.lozad', {
    loaded: (el) => {
      el.classList.add('loaded')
    }
  })
  observer.observe()

  if ($openSecondaryMenu.length > 0) {
    const template = document.getElementById('secondary-navigation-template')

    secondaryMenuTippy = tippy('.js-tooltip-secondary-menu', {
      content: template.innerHTML,
      allowHTML: true,
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
