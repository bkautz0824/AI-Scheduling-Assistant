"use client"
import React from 'react'
import CalendarDisplay from '@/components/CalendarDisplay'
import Link from 'next/link'

export default function Calendar() {
  return (
    <div>
           <CalendarDisplay />
           <Link href="/" passHref>
            <button>
              Link to Home
            </button>
          </Link>
    </div>
  )
}
