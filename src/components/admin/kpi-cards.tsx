import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export default function KPICards() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 md:col-span-4">
        <Card className=''>
          <CardHeader><CardTitle>New Users</CardTitle></CardHeader>
          <CardContent>
            <p className='text-3xl md:text-4xl font-bold'>21</p>
          </CardContent>
        </Card>
      </div>
      <div className="col-span-12 md:col-span-4">
        <Card className=''>
          <CardHeader><CardTitle>New Verified Requests</CardTitle></CardHeader>
          <CardContent>
            <p className='text-3xl md:text-4xl font-bold'>21</p>
          </CardContent>
        </Card>
      </div>
      <div className="col-span-12 md:col-span-4">
        <Card className=''>
          <CardHeader><CardTitle>New Support Tickets</CardTitle></CardHeader>
          <CardContent>
            <p className='text-3xl md:text-4xl font-bold'>21</p>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}