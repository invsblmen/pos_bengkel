import React from 'react'
import StockCreate from './Create'
import DashboardLayout from '@/Layouts/DashboardLayout'

export default function Out(props) {
    // reuse Create page but fix type to 'out'
    return <StockCreate {...props} type="out" />
}

Out.layout = (page) => <DashboardLayout children={page} />
