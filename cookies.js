const VERSION = 1

function buildCookiesToInvitation(url, cookies) {
  let cookiesToSend = [];
  for (let cookie of cookies) {
    cookiesToSend.push({
      domain: cookie.domain,
      expirationDate: cookie.expirationDate,
      firstPartyDomain: cookie.firstPartyDomain,
      httpOnly: cookie.httpOnly,
      name: cookie.name,
      path: cookie.path,
      sameSite: cookie.sameSite,
      secure: cookie.secure,
      url: url,
      value: cookie.value
    })
  }

  const data = {
    'u': url,
    'c': cookiesToSend
  }

  return `Session-Invite-${VERSION}${LZString.compressToEncodedURIComponent(JSON.stringify(data))}`
}

function parseCookiesFromInvitation(invitationStr) {
  if (invitationStr.indexOf(`Session-Invite-${VERSION}`) !== 0) {
    alert("May be unable to load invitation");
  }

  const strData = invitationStr.substring(16);
  const decodedStrData = LZString.decompressFromEncodedURIComponent(strData);
  const data = JSON.parse(decodedStrData);

  return data;
}

function showCookiesForTab(tabs) {
  //get the first tab object in the array
  let tab = tabs.pop();

  //get all cookies in the domain
  var gettingAllCookies = browser.cookies.getAll({url: tab.url});
  gettingAllCookies.then((cookies) => {

    //set the header of the panel
    document.getElementById('website_name_label').innerText = tab.title;

    if (cookies.length > 0) {
      const cookieString = buildCookiesToInvitation(tab.url, cookies);
      document.getElementById("copy_session_share").setAttribute("title", cookieString);
      document.getElementById("copy_session_share").addEventListener("click", () => {
        navigator.clipboard.writeText(cookieString);
      })
    } else {
      document.getElementById("share_session_panel").style.display = "none";
    }
  });

  document.getElementById("load_session_btn").addEventListener("click", () => {
    const data = parseCookiesFromInvitation(document.getElementById("load_session_entry").value);
    console.log(data);
    for (const cookieConf of data['c']) {
      browser.cookies.set(cookieConf);
    }

    browser.tabs.create({
      active: true,
      url: data['u']
    })
  })
 
}

//get active tab to run an callback function.
//it sends to our callback an array of tab objects
function getActiveTab() {
  return browser.tabs.query({currentWindow: true, active: true});
}
getActiveTab().then(showCookiesForTab);