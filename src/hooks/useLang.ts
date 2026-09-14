import { useState, useEffect } from 'react'

const KEY = 'gosulawesi_lang'

export type Lang = 'en' | 'id'

export function getStoredLang(): Lang {
  const v = localStorage.getItem(KEY)
  return v === 'id' ? 'id' : 'en'
}

export function setStoredLang(lang: Lang) {
  localStorage.setItem(KEY, lang)
}

export function useLang() {
  const [lang, setLang] = useState<Lang>(getStoredLang())

  useEffect(() => {
    setLang(getStoredLang())
  }, [])

  const changeLang = (l: Lang) => {
    setStoredLang(l)
    setLang(l)
  }

  return { lang, setLang: changeLang }
}
