import { getUserData, UserData } from '@decentraland/Identity'

// get player data
export let userData: UserData

export async function setUserData() {
  const data = await getUserData()
  log(data.displayName)
  userData = data
}

// external servers being used by the project - Please change these to your own if working on something else!
export const fireBaseServer =
  'https://us-central1-dmm-deneme.cloudfunctions.net/app/'

// get latest scoreboard data from server
export async function getGuestBook() {
  log('inside getGuestBook()') //added by eg
  try {

    const url = fireBaseServer + 'get-signatures'

  
    const response = await fetch(url,{
      method: 'GET',
      headers: { 'Content-Type': 'application/json',
                  'authID':      'foo'}
    })
    
    const json = await response.json()
    
    return json
  } catch (e) {
    log('error fetching scores from server ', e)
  }
}

// change data in scoreboard
export async function signGuestBook() {
  if (!userData) {
    await setUserData()
  }
  try {
    const url = fireBaseServer + 'add-signature'
    let oldCount = getCount((await userData).userId)
    const body = JSON.stringify({
      id: (await userData).userId,
      name: (await userData).displayName,
    })
 
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
                  'authID':      'foo' },
      body: body
    })

    return response.json()

  } catch (e) {
    log('error posting to server ', e)
  }
}

export async function getCount(userID: string) {
  let guestArray = await getGuestBook();
  for (let i = 0; i < guestArray.size(); i++) {
    if (guestArray[i].id == userID) {
      return guestArray[i].count;
    }
  }
}