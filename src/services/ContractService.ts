
import { supabase } from "@/integrations/supabase/client";

export interface ContractData {
    host_id: string;
    student_id: string;
    listing_id: number;
    terms: any;
    status: 'pending' | 'signed' | 'active' | 'completed' | 'cancelled';
}

export const ContractService = {
    async createContract(data: ContractData) {
        const { error } = await supabase
            .from('contracts')
            .insert(data);
        return { error };
    },

    async getContract(id: string) {
        const { data, error } = await supabase
            .from('contracts')
            .select(`
                *,
                host:profiles!contracts_host_id_fkey(first_name, last_name),
                student:profiles!contracts_student_id_fkey(first_name, last_name),
                listing:listings(title, price, location, housing_rules)
            `)
            .eq('id', id)
            .single();
        return { data, error };
    },

    async signContract(id: string) {
        const { error } = await supabase
            .from('contracts')
            .update({
                status: 'signed',
                signed_at: new Date().toISOString()
            })
            .eq('id', id);
        return { error };
    }
};
