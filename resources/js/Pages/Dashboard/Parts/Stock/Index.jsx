import React, { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function Index() {
    useEffect(() => {
        router.get(route('part-stock-history.index'), {}, { replace: true });
    }, []);

    return null;
}
