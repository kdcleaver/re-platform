import { YBOR_3106_N_17TH } from "./3106-n-17th-st.js";
import { STPETE_1761_19TH_S } from "./1761-19th-st-s.js";
import { STPETE_1846_2ND_AVE_N } from "./1846-2nd-ave-n.js";
import { STPETE_725_14TH_AVE_S } from "./725-14th-ave-s.js";
import { STPETE_935_17TH_AVE_S } from "./935-17th-ave-s.js";
import { CLW_15501_61ST_ST_N } from "./15501-61st-st-n.js";
import { TPA_236_W_NORTH_ST } from "./236-w-north-st.js";
import { CLW_208_212_ELIZABETH } from "./208-212-elizabeth-ave.js";
import { STPETE_633_7TH_AVE_N } from "./633-7th-ave-n.js";
import { TPA_2613_E_23RD_AVE } from "./2613-e-23rd-ave.js";
import { TPA_7711_AMHERST_ST } from "./7711-amherst-st.js";
import { TPA_9502_BANYAN_AVE } from "./9502-banyan-ave.js";
import { TPA_7902_N_14TH_ST } from "./7902-n-14th-st.js";

/** Oct 2026 batch: the three deals the engine was first built on. */
export const OCT_BATCH = [YBOR_3106_N_17TH, STPETE_1761_19TH_S, STPETE_1846_2ND_AVE_N];

/** Sept 2026 batch: the ten listings behind buybox_check.py v0, re-pulled 2026-10-20. */
export const SEPT_BATCH = [
  TPA_236_W_NORTH_ST, STPETE_633_7TH_AVE_N, STPETE_725_14TH_AVE_S, STPETE_935_17TH_AVE_S, CLW_15501_61ST_ST_N,
  CLW_208_212_ELIZABETH, TPA_2613_E_23RD_AVE, TPA_7711_AMHERST_ST, TPA_9502_BANYAN_AVE, TPA_7902_N_14TH_ST,
];

export const DEALS = [...OCT_BATCH, ...SEPT_BATCH];

export {
  YBOR_3106_N_17TH, STPETE_1761_19TH_S, STPETE_1846_2ND_AVE_N, STPETE_725_14TH_AVE_S, STPETE_935_17TH_AVE_S,
  CLW_15501_61ST_ST_N, TPA_236_W_NORTH_ST, CLW_208_212_ELIZABETH, STPETE_633_7TH_AVE_N, TPA_2613_E_23RD_AVE,
  TPA_7711_AMHERST_ST, TPA_9502_BANYAN_AVE, TPA_7902_N_14TH_ST,
};
