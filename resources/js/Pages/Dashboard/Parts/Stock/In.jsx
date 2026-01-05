import React from 'react'
import StockCreate from './Create'
import DashboardLayout from '@/Layouts/DashboardLayout'

export default function In(props) {
    // reuse Create page but fix type to 'in'
    return <StockCreate {...props} type="in" />
}

In.layout = (page) => <DashboardLayout children={page} />
