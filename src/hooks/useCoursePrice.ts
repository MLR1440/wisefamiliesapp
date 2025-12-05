import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PriceData {
  amount: number;
  currency: string;
}

export const useCoursePrice = () => {
  const [price, setPrice] = useState<PriceData>({ amount: 99, currency: 'usd' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-price');
        if (!error && data?.amount) {
          setPrice({ amount: data.amount, currency: data.currency || 'usd' });
        }
      } catch (err) {
        console.error('Error fetching price:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, []);

  const formattedPrice = `$${price.amount}`;

  return { price, formattedPrice, loading };
};
