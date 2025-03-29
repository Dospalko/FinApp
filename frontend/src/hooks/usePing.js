import { useState, useEffect } from 'react';
import { pingBackend } from '../api/expenseApi'; // Alebo z iného API súboru

export function usePing(autoHideDelay = 5000) {
    const [pingMessage, setPingMessage] = useState("Testujem spojenie s backendom...");
    const [showPing, setShowPing] = useState(true);

    useEffect(() => {
        let isMounted = true; // Pre cleanup
        let timer;

        pingBackend()
            .then(data => {
                if (isMounted) setPingMessage(data.message || "Backend je pripojený.");
            })
            .catch(err => {
                if (isMounted) setPingMessage(`Backend nedostupný: ${err.response?.data?.error || err.message}`);
            })
            .finally(() => {
                if (isMounted && autoHideDelay > 0) {
                   timer = setTimeout(() => {
                       if(isMounted) setShowPing(false);
                    }, autoHideDelay);
                }
            });

        // Cleanup funkcia
        return () => {
            isMounted = false;
            if (timer) clearTimeout(timer);
        };
    }, [autoHideDelay]); // Znovu sa nespustí, pokiaľ sa nezmení delay

    return { pingMessage, showPing };
}