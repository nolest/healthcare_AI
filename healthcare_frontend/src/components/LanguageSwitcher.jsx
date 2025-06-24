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
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-gray-500" />
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

