/* ================================================
   js/supabase-config.js
   Este archivo conecta la app con Supabase
   ================================================ */

const supabaseUrl = 'https://gacwwqkjldwcfdpnzyal.supabase.co';
const supabaseKey = 'sb_publishable_mDztd-M1FELGapqyHDCuxg_u-ruD8fv'; 

// Inicializamos el cliente para que sea GLOBAL
const { createClient } = supabase;
const db = createClient(supabaseUrl, supabaseKey);