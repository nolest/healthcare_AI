import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Globe } from 'lucide-react'
import i18n from '../utils/i18n'

export default function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (language) => {
      setCurrentLanguage(language)
    }

    i18n.addListener(handleLanguageChange)
    return () => i18n.removeListener(handleLanguageChange)
  }, [])

  const handleLanguageChange = (language) => {
    i18n.setLanguage(language)
  }

  const languages = i18n.getAvailableLanguages()

  return (
    <div className="flex items-center space-x-3 px-4 h-full">
      <div className="p-1.5 bg-gradient-to-br from-blue-500/70 to-indigo-600/70 rounded-xl shadow-sm">
        <Globe className="h-4 w-4 text-white" />
      </div>
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-auto min-w-[4rem] border-0 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 hover:bg-white/30 transition-all duration-200 rounded-xl px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-700">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-0 bg-gradient-to-br from-white/98 to-white/95 backdrop-blur-xl shadow-2xl shadow-blue-500/25 rounded-2xl p-2 min-w-[8rem]">
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 focus:bg-gradient-to-r focus:from-blue-50 focus:to-indigo-50 transition-all duration-200 cursor-pointer py-2.5 px-3 text-sm font-medium"
            >
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

