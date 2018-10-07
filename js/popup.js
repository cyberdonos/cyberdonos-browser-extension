const getAccountData = () => {

  return browser.runtime.sendMessage({ action: "getAccountData" })
  .then((result) => {
    console.log(`Получены данные об аккаунте ${JSON.stringify(result)}`)
    document.querySelector(`span.role`).textContent = result.role_name
    document.querySelector(`input.token`).value = result.token
  })
}
document.querySelector(`button.set-token`).addEventListener('click', () => {
  const token = document.querySelector(`input.token`).value
  if (/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/.test(token)) {
    browser.runtime.sendMessage({ action: "setToken", data: token })
    .then(result => {
      alert(result.message)
    })
    .catch(e => console.error(e))
  }
  else {
    console.log(`Неверный формат`)
  }
})
getAccountData()
.catch(e => console.error(`error in popup.js cyberdonos ${e}`))
console.log("Popup is started")
