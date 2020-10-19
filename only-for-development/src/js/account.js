import $ from 'jquery'

$(document).ready(() => {
  const $planNickname = $('.js-plan-nickname')
  const $planStatus = $('.js-plan-status')
  const $planPrice = $('.js-plan-price')
  const $planInterval = $('.js-plan-interval')

  if ($planNickname.length > 0) {
    $planNickname.each(function () {
      $(this).text(labels[$(this).attr('data-nickname')])
    })
  }

  if ($planStatus.length > 0) {
    $planStatus.each(function () {
      $(this).attr('data-visibility', labels[$(this).attr('data-status')])
    })
  }

  if ($planPrice.length > 0) {
    $planPrice.each(function () {
      const planAmount = parseInt($(this).attr('data-plan-price')) / 100
      $(this).text(planAmount)
    })
  }

  if ($planInterval.length > 0) {
    $planInterval.each(function () {
      $(this).text(labels[$(this).attr('data-interval')])
    })
  }
})
