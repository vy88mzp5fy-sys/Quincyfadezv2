import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ClientManagementPanel from "./ClientManagementPanel";
import AdminPaymentsPanel from "./AdminPaymentsPanel";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "quincyfadez.adminToken";

const C = {
  bg: "#050505",
  surface: "#0E0C08",
  surface2: "#151006",
  surface3: "#1C160B",
  gold: "#D6BD7A",
  goldSoft: "#F1DDA2",
  goldDeep: "#A9873F",
  text: "#FBFAF6",
  text2: "#E8E2D8",
  muted: "#AAA49A",
  muted2: "#7E7A73",
  border: "#352D20",
  borderSoft: "#25221C",
  danger: "#DE9186",
  dangerBg: "#1B0D0B",
};

const DAYS = [
  ["0", "Monday"], ["1", "Tuesday"], ["2", "Wednesday"], ["3", "Thursday"],
  ["4", "Friday"], ["5", "Saturday"], ["6", "Sunday"],
];

const NAV = [
  ["home", "Home"],
  ["schedule", "Schedule"],
  ["insights", "Insights"],
  ["clients", "Clients"],
  ["settings", "Settings"],
];

const REVIEW_URL = "https://g.page/r/CbQwl91s8_vqEBM/review";
const WHATSAPP_URL = "https://wa.me/447490194682";
const BOOKING_LINK = "https://quincyfadez.com";

const money = (value) => {
  const n = Number(value || 0);
  return `£${n.toFixed(n % 1 ? 2 : 0)}`;
};
const fmtTime = (value) => value ? new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/London" }) : "—";
const fmtDate = (value) => value ? new Date(value).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London" }) : "—";
const fmtLongDate = (value) => value ? new Date(value).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/London" }) : "—";
const sortBookings = (items) => [...(items || [])].sort((a, b) => String(a.start_at_utc || a.start_at || "").localeCompare(String(b.start_at_utc || b.start_at || "")));
const statusLabel = (value) => String(value || "confirmed").replaceAll("_", " ").replace(/\b\w/g, (x) => x.toUpperCase());

async function readJson(response) {
  return response.json().catch(() => ({}));
}

function NavGlyph({ type, active }) {
  const tone = active ? C.goldSoft : "#77736C";
  if (type === "home") return <View style={[s.homeGlyph, { borderColor: tone }]}><View style={[s.homeGlyphDot, { backgroundColor: tone }]} /></View>;
  if (type === "schedule") return <View style={[s.calendarGlyph, { borderColor: tone }]}><View style={[s.calendarTop, { backgroundColor: tone }]} /><View style={s.calendarDots}><View style={[s.calendarDot, { backgroundColor: tone }]} /><View style={[s.calendarDot, { backgroundColor: tone }]} /><View style={[s.calendarDot, { backgroundColor: tone }]} /></View></View>;
  if (type === "insights") return <View style={s.barsGlyph}><View style={[s.bar1, { backgroundColor: tone }]} /><View style={[s.bar2, { backgroundColor: tone }]} /><View style={[s.bar3, { backgroundColor: tone }]} /></View>;
  if (type === "clients") return <View style={s.clientsGlyph}><View style={[s.personHead, { borderColor: tone }]} /><View style={[s.personBody, { borderColor: tone }]} /></View>;
  return <View style={s.settingsGlyph}><View style={[s.settingLine, { backgroundColor: tone }]} /><View style={[s.settingLineShort, { backgroundColor: tone }]} /><View style={[s.settingLine, { backgroundColor: tone }]} /></View>;
}

function BottomNav({ tab, setTab }) {
  return <SafeAreaView style={s.navSafe}><View style={s.navShell}>{NAV.map(([key, label]) => {
    const active = tab === key;
    return <Pressable key={key} onPress={() => setTab(key)} style={({ pressed }) => [s.navItem, active && s.navItemActive, pressed && s.pressed]}>
      <NavGlyph type={key} active={active} />
      <Text style={[s.navLabel, active && s.navLabelActive]}>{label}</Text>
    </Pressable>;
  })}</View></SafeAreaView>;
}

function SectionHeader({ eyebrow, title, right }) {
  return <View style={s.sectionHeader}><View style={s.sectionHeaderCopy}><Text style={s.eyebrow}>{eyebrow}</Text><Text style={s.sectionTitle}>{title}</Text></View>{right || null}</View>;
}

function Metric({ label, value, meta }) {
  return <View style={s.metric}><Text style={s.metricLabel}>{label}</Text><Text style={s.metricValue}>{value}</Text>{meta ? <Text style={s.metricMeta}>{meta}</Text> : null}</View>;
}

function Toggle({ value, onChange, disabled }) {
  return <Pressable disabled={disabled} onPress={() => onChange(!value)} style={[s.toggle, value && s.toggleOn, disabled && s.disabled]}><View style={[s.toggleKnob, value && s.toggleKnobOn]} /></Pressable>;
}

function SettingRow({ title, meta, right, onPress, last = false }) {
  const content = <View style={[s.settingRow, !last && s.settingBorder]}><View style={s.settingCopy}><Text style={s.settingName}>{title}</Text>{meta ? <Text style={s.settingMeta}>{meta}</Text> : null}</View><View style={s.settingRight}>{right || <Text style={s.chevron}>›</Text>}</View></View>;
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => [pressed && s.rowPressed]}>{content}</Pressable> : content;
}

function SettingsGroup({ title, children }) {
  return <View style={s.settingsGroup}><Text style={s.settingsGroupTitle}>{title}</Text><View style={s.settingsCard}>{children}</View></View>;
}

function SelectButton({ label, onPress, disabled }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[s.selectButton, disabled && s.disabled]}><Text style={s.selectButtonText}>{label}</Text><Text style={s.selectArrow}>⌄</Text></Pressable>;
}

function SelectModal({ picker, close }) {
  if (!picker) return null;
  return <Modal transparent visible animationType="fade" onRequestClose={close}>
    <Pressable style={s.modalBackdrop} onPress={close}>
      <Pressable style={s.selectSheet} onPress={() => {}}>
        <View style={s.sheetHandle} />
        <Text style={s.sheetEyebrow}>CHOOSE A VALUE</Text>
        <Text style={s.sheetTitle}>{picker.title}</Text>
        <ScrollView style={s.selectOptions} contentContainerStyle={s.selectOptionsContent}>
          {picker.options.map((opt) => {
            const value = typeof opt === "object" ? opt.value : opt;
            const label = typeof opt === "object" ? opt.label : String(opt);
            const active = String(value) === String(picker.value);
            return <Pressable key={`${value}-${label}`} onPress={() => { picker.onChoose(value); close(); }} style={[s.optionRow, active && s.optionRowActive]}><Text style={[s.optionText, active && s.optionTextActive]}>{label}</Text>{active ? <Text style={s.optionCheck}>✓</Text> : null}</Pressable>;
          })}
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>;
}

function AppointmentCard({ booking, onStatus, busy }) {
  const status = booking.status || "confirmed";
  const actionBusy = busy === booking.id;
  return <View style={s.appointmentCard}>
    <View style={s.appointmentTop}>
      <View style={s.timeBlock}><Text style={s.bookingTime}>{fmtTime(booking.start_at)}</Text><Text style={s.durationText}>{booking.duration_minutes || 0} MIN</Text></View>
      <View style={s.appointmentCopy}><Text style={s.bookingName}>{booking.customer_name || "Client"}</Text><Text style={s.bookingService}>{booking.service || "Appointment"}</Text><Text style={s.bookingMeta}>{money(booking.price)} · {fmtDate(booking.start_at)}</Text></View>
      <View style={[s.statusPill, status === "pending" && s.statusPending, status === "completed" && s.statusCompleted]}><Text style={s.statusText}>{statusLabel(status).toUpperCase()}</Text></View>
    </View>
    {onStatus && ["confirmed", "pending"].includes(status) ? <View style={s.bookingActions}>
      <Pressable disabled={actionBusy} onPress={() => onStatus(booking, status === "pending" ? "confirmed" : "completed")} style={[s.primarySmall, actionBusy && s.disabled]}><Text style={s.primarySmallText}>{status === "pending" ? "APPROVE" : "COMPLETE"}</Text></Pressable>
      {status === "confirmed" ? <Pressable disabled={actionBusy} onPress={() => onStatus(booking, "no_show")} style={[s.secondarySmall, actionBusy && s.disabled]}><Text style={s.secondarySmallText}>NO-SHOW</Text></Pressable> : null}
      <Pressable disabled={actionBusy} onPress={() => onStatus(booking, "cancelled")} style={[s.dangerSmall, actionBusy && s.disabled]}><Text style={s.dangerSmallText}>{status === "pending" ? "DECLINE" : "CANCEL"}</Text></Pressable>
    </View> : null}
  </View>;
}

function WorkingHours({ hours, saving, onSave }) {
  const [draft, setDraft] = useState(hours || {});
  useEffect(() => setDraft(hours || {}), [hours]);
  const toggleDay = (key) => setDraft((cur) => ({ ...cur, [key]: (cur[key] || []).length ? [] : [["", ""]] }));
  const add = (key) => setDraft((cur) => ({ ...cur, [key]: [...(cur[key] || []), ["", ""]] }));
  const remove = (key, index) => setDraft((cur) => ({ ...cur, [key]: (cur[key] || []).filter((_, i) => i !== index) }));
  const change = (key, index, side, value) => setDraft((cur) => {
    const windows = [...(cur[key] || [])];
    const next = [...(windows[index] || ["", ""])];
    next[side] = value;
    windows[index] = next;
    return { ...cur, [key]: windows };
  });
  const valid = Object.values(draft).every((windows) => (windows || []).every((w) => /^\d{2}:\d{2}$/.test(w?.[0] || "") && /^\d{2}:\d{2}$/.test(w?.[1] || "") && w[1] > w[0]));
  return <View style={s.managerCard}>
    <SectionHeader eyebrow="YOUR WEEK" title="Working Hours" right={<Pressable disabled={!valid || saving} onPress={() => onSave(draft)} style={[s.goldSave, (!valid || saving) && s.disabled]}><Text style={s.goldSaveText}>{saving ? "SAVING…" : "SAVE"}</Text></Pressable>} />
    <Text style={s.managerHelp}>Choose exactly which days you work and enter the start and finish times. Closed days never create booking slots.</Text>
    {DAYS.map(([key, label]) => {
      const windows = draft[key] || [];
      return <View key={key} style={s.dayCard}>
        <View style={s.dayHead}><View><Text style={s.dayName}>{label}</Text><Text style={s.dayMeta}>{windows.length ? "OPEN FOR BOOKINGS" : "CLOSED"}</Text></View><Toggle value={windows.length > 0} onChange={() => toggleDay(key)} disabled={saving} /></View>
        {windows.map((window, index) => <View key={`${key}-${index}`} style={s.windowRow}>
          <View style={s.timeField}><Text style={s.inputLabel}>START</Text><TextInput value={window[0]} onChangeText={(v) => change(key, index, 0, v)} placeholder="09:00" placeholderTextColor="#5C5851" maxLength={5} keyboardType="numbers-and-punctuation" style={s.timeInput} /></View>
          <Text style={s.timeDash}>—</Text>
          <View style={s.timeField}><Text style={s.inputLabel}>FINISH</Text><TextInput value={window[1]} onChangeText={(v) => change(key, index, 1, v)} placeholder="18:00" placeholderTextColor="#5C5851" maxLength={5} keyboardType="numbers-and-punctuation" style={s.timeInput} /></View>
          {windows.length > 1 ? <Pressable onPress={() => remove(key, index)} style={s.removeButton}><Text style={s.removeText}>×</Text></Pressable> : null}
        </View>)}
        {windows.length ? <Pressable onPress={() => add(key)} style={s.addWindow}><Text style={s.addWindowText}>＋ ADD SPLIT SHIFT / SECOND WINDOW</Text></Pressable> : null}
      </View>;
    })}
  </View>;
}

function BlockTime({ settings, busy, onCreate, onDelete }) {
  const [label, setLabel] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(start) && /^\d{2}:\d{2}$/.test(end) && end > start;
  const submit = async () => {
    if (!valid || busy) return;
    const ok = await onCreate({ label: label.trim() || "Blocked Time", start_at: new Date(`${date}T${start}:00`).toISOString(), end_at: new Date(`${date}T${end}:00`).toISOString() });
    if (ok) { setLabel(""); setDate(""); setStart(""); setEnd(""); }
  };
  const blocks = [...(settings?.blocked_periods || [])].sort((a, b) => String(a.start || "").localeCompare(String(b.start || "")));
  return <View style={s.managerCard}>
    <SectionHeader eyebrow="TIME OFF" title="Block Time" />
    <Text style={s.managerHelp}>Add lunch, personal appointments, holidays or closures. Those times disappear from client availability.</Text>
    <TextInput value={label} onChangeText={setLabel} placeholder="Reason · e.g. Lunch / Holiday" placeholderTextColor="#5C5851" style={s.bigInput} />
    <TextInput value={date} onChangeText={setDate} placeholder="Date · YYYY-MM-DD" placeholderTextColor="#5C5851" keyboardType="numbers-and-punctuation" maxLength={10} style={s.bigInput} />
    <View style={s.twoInputs}><TextInput value={start} onChangeText={setStart} placeholder="Start · 13:00" placeholderTextColor="#5C5851" keyboardType="numbers-and-punctuation" maxLength={5} style={[s.bigInput, s.halfInput]} /><TextInput value={end} onChangeText={setEnd} placeholder="Finish · 14:00" placeholderTextColor="#5C5851" keyboardType="numbers-and-punctuation" maxLength={5} style={[s.bigInput, s.halfInput]} /></View>
    <Pressable disabled={!valid || busy} onPress={submit} style={[s.primaryButton, (!valid || busy) && s.disabled]}><Text style={s.primaryButtonText}>{busy ? "SAVING…" : "BLOCK THIS TIME"}</Text></Pressable>
    <Text style={s.listLabel}>UPCOMING BLOCKED TIME</Text>
    {blocks.length ? blocks.map((block) => <View key={block.id || block.start} style={s.blockRow}><View style={{ flex: 1 }}><Text style={s.blockTitle}>{block.label || "Blocked Time"}</Text><Text style={s.blockMeta}>{fmtLongDate(block.start)} · {fmtTime(block.start)}–{fmtTime(block.end)}</Text></View><Pressable disabled={busy} onPress={() => onDelete(block.id)} style={s.removeBlock}><Text style={s.removeBlockText}>REMOVE</Text></Pressable></View>) : <Text style={s.emptyText}>No blocked time added yet.</Text>}
  </View>;
}

function DetailModal({ type, close, settings, services, saving, saveSettings, logout }) {
  const profile = settings?.business_profile || {};
  const policies = settings?.policies || {};
  const [draft, setDraft] = useState({});
  useEffect(() => {
    if (type === "profile") setDraft({ business_name: profile.business_name || "QuincyFadez", owner_name: profile.owner_name || "", phone: profile.phone || "", email: profile.email || "" });
    else if (type === "location") setDraft({ address: profile.address || "", city: profile.city || "Oxford", postcode: profile.postcode || "", maps_url: profile.maps_url || "" });
    else if (type === "policies") setDraft({ booking: policies.booking || "", cancellation: policies.cancellation || "", lateness: policies.lateness || "", payment: policies.payment || "" });
  }, [type]);
  if (!type) return null;

  const saveProfile = async () => {
    if (type === "policies") { const ok = await saveSettings({ policies: { ...policies, ...draft } }); if (ok) close(); return; }
    const ok = await saveSettings({ business_profile: { ...profile, ...draft } });
    if (ok) close();
  };

  const titleMap = {
    profile: "Profile",
    services: "Services",
    location: "Location",
    payments: "Payments",
    subscriptions: "Client Subscriptions",
    reviews: "Reviews",
    promotions: "Promotions",
    referral: "Referral Programme",
    card: "Digital Business Card",
    policies: "Policies",
    account: "Account",
    help: "Help & Support",
    faqs: "FAQs",
    feedback: "Send Feedback",
  };

  return <Modal visible animationType="slide" onRequestClose={close}>
    <SafeAreaView style={s.detailSafe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.detailHeader}><View><Text style={s.detailEyebrow}>QUINCYFADEZ SETTINGS</Text><Text style={s.detailTitle}>{titleMap[type] || "Settings"}</Text></View><Pressable onPress={close} style={s.closeButton}><Text style={s.closeText}>×</Text></Pressable></View>
      <ScrollView contentContainerStyle={s.detailContent} keyboardShouldPersistTaps="handled">
        {type === "profile" ? <><Text style={s.detailHelp}>Keep your business details together in one place.</Text><LabeledInput label="BUSINESS NAME" value={draft.business_name} set={(v) => setDraft((d) => ({ ...d, business_name: v }))} /><LabeledInput label="OWNER NAME" value={draft.owner_name} set={(v) => setDraft((d) => ({ ...d, owner_name: v }))} /><LabeledInput label="PHONE" value={draft.phone} set={(v) => setDraft((d) => ({ ...d, phone: v }))} keyboardType="phone-pad" /><LabeledInput label="EMAIL" value={draft.email} set={(v) => setDraft((d) => ({ ...d, email: v }))} keyboardType="email-address" /><SaveButton saving={saving} onPress={saveProfile} /></> : null}
        {type === "location" ? <><Text style={s.detailHelp}>Set the location clients see when checking appointment details.</Text><LabeledInput label="ADDRESS" value={draft.address} set={(v) => setDraft((d) => ({ ...d, address: v }))} /><LabeledInput label="CITY" value={draft.city} set={(v) => setDraft((d) => ({ ...d, city: v }))} /><LabeledInput label="POSTCODE" value={draft.postcode} set={(v) => setDraft((d) => ({ ...d, postcode: v }))} autoCapitalize="characters" /><LabeledInput label="GOOGLE MAPS LINK · OPTIONAL" value={draft.maps_url} set={(v) => setDraft((d) => ({ ...d, maps_url: v }))} autoCapitalize="none" /><SaveButton saving={saving} onPress={saveProfile} /></> : null}
        {type === "services" ? <><Text style={s.detailHelp}>These are the services currently live in the booking system.</Text>{(services || []).map((item) => <View key={item.name} style={s.serviceSetting}><View><Text style={s.serviceSettingName}>{item.name}</Text><Text style={s.serviceSettingMeta}>{item.duration_minutes} minutes</Text></View><Text style={s.serviceSettingPrice}>{money(item.price)}</Text></View>)}<Text style={s.detailNote}>Service editing is deliberately not faked here. Prices and durations are currently controlled by the live booking service configuration; we can make those editable safely in the next backend pass.</Text></> : null}
        {type === "payments" ? <AdminPaymentsPanel settings={settings} saving={saving} onSave={saveSettings} /> : null}
        {type === "subscriptions" ? <InfoCard title="Memberships" text="This section is ready for QuincyFadez memberships and client plans. It will become transactional once subscription billing is connected so allowances and payments stay accurate." /> : null}
        {type === "reviews" ? <><InfoCard title="Review Flow" text="Your automated review prompt can be controlled from Notifications & Automations. Use the button below to open the live Google review page." /><Pressable onPress={() => Linking.openURL(REVIEW_URL)} style={s.primaryButton}><Text style={s.primaryButtonText}>OPEN GOOGLE REVIEWS</Text></Pressable></> : null}
        {type === "promotions" ? <InfoCard title="Promotions" text="Use the Promotions toggle in Business & Growth to decide whether controlled client offers are active. Campaign creation will only be added when redemption and reporting are reliable." /> : null}
        {type === "referral" ? <InfoCard title="Referral Programme" text="The referral switch is live. Reward rules will be added when referral attribution can be tracked correctly end to end." /> : null}
        {type === "card" ? <><InfoCard title="Digital Business Card" text="Share QuincyFadez contact and booking details straight from your phone." /><Pressable onPress={() => Share.share({ message: `QuincyFadez · Oxford Barber\nBook: ${BOOKING_LINK}\nWhatsApp: +44 7490 194682` })} style={s.primaryButton}><Text style={s.primaryButtonText}>SHARE BUSINESS CARD</Text></Pressable></> : null}
        {type === "policies" ? <><Text style={s.detailHelp}>Keep client-facing policy notes concise and easy to understand.</Text><LabeledInput multiline label="BOOKING POLICY" value={draft.booking} set={(v) => setDraft((d) => ({ ...d, booking: v }))} /><LabeledInput multiline label="CANCELLATION POLICY" value={draft.cancellation} set={(v) => setDraft((d) => ({ ...d, cancellation: v }))} /><LabeledInput multiline label="LATENESS POLICY" value={draft.lateness} set={(v) => setDraft((d) => ({ ...d, lateness: v }))} /><LabeledInput multiline label="PAYMENT POLICY" value={draft.payment} set={(v) => setDraft((d) => ({ ...d, payment: v }))} /><SaveButton saving={saving} onPress={saveProfile} /></> : null}
        {type === "account" ? <><InfoCard title="Secure Owner Session" text="Your admin session is server verified and stored securely on this device. Clients never see an Admin option in the app." /><Pressable onPress={logout} style={s.dangerButton}><Text style={s.dangerButtonText}>LOG OUT OF ADMIN</Text></Pressable></> : null}
        {type === "help" ? <><InfoCard title="Help & Support" text="If you need to check a live booking issue while testing, open WhatsApp and send yourself the details you want to investigate." /><Pressable onPress={() => Linking.openURL(WHATSAPP_URL)} style={s.primaryButton}><Text style={s.primaryButtonText}>OPEN WHATSAPP</Text></Pressable></> : null}
        {type === "faqs" ? <><Faq q="Why are no booking times showing?" a="Set Working Hours first. The app never invents availability." /><Faq q="Why is a payment marked Not Charged?" a="Card verification protects the booking but does not automatically charge the service price." /><Faq q="Where are booking requests?" a="They appear on Home when Booking Approval is switched on." /><Faq q="Where do I control reminders?" a="Settings → Notifications & Automations." /></> : null}
        {type === "feedback" ? <><InfoCard title="Send Feedback" text="Open WhatsApp to capture app feedback quickly while you are testing on your phone." /><Pressable onPress={() => Linking.openURL(`${WHATSAPP_URL}?text=${encodeURIComponent("QuincyFadez App Feedback: ")}`)} style={s.primaryButton}><Text style={s.primaryButtonText}>SEND FEEDBACK</Text></Pressable></> : null}
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}

function LabeledInput({ label, value, set, keyboardType, multiline, autoCapitalize }) {
  return <View style={s.fieldWrap}><Text style={s.inputLabel}>{label}</Text><TextInput value={value || ""} onChangeText={set} keyboardType={keyboardType} autoCapitalize={autoCapitalize || (keyboardType === "email-address" ? "none" : "words")} multiline={multiline} placeholderTextColor="#5C5851" style={[s.bigInput, multiline && s.multilineInput]} /></View>;
}
function SaveButton({ saving, onPress }) { return <Pressable disabled={saving} onPress={onPress} style={[s.primaryButton, saving && s.disabled]}>{saving ? <ActivityIndicator color="#090909" /> : <Text style={s.primaryButtonText}>SAVE CHANGES</Text>}</Pressable>; }
function InfoCard({ title, text }) { return <View style={s.infoCard}><Text style={s.infoCardTitle}>{title}</Text><Text style={s.infoCardText}>{text}</Text></View>; }
function Faq({ q, a }) { return <View style={s.faq}><Text style={s.faqQ}>{q}</Text><Text style={s.faqA}>{a}</Text></View>; }

export default function AdminScreenModern({ onExit }) {
  const [token, setToken] = useState("");
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("home");
  const [scheduleMode, setScheduleMode] = useState("appointments");
  const [overview, setOverview] = useState(null);
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [insights, setInsights] = useState(null);
  const [insightPeriod, setInsightPeriod] = useState("week");
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [clientDetail, setClientDetail] = useState(null);
  const [clientNotes, setClientNotes] = useState("");
  const [settings, setSettings] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [blockBusy, setBlockBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState("");
  const [clientBusy, setClientBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [picker, setPicker] = useState(null);
  const [detailType, setDetailType] = useState("");

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then((value) => { setToken(value || ""); setChecking(false); }).catch(() => setChecking(false));
  }, []);

  const request = useCallback(async (path, options = {}) => {
    if (!token || !API_URL) throw new Error("Admin connection is not available.");
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    });
    const data = await readJson(response);
    if (response.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
      setToken("");
      throw new Error("Your admin session expired. Log in again.");
    }
    if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "That admin action could not be completed.");
    return data;
  }, [token]);

  const loadHome = useCallback(async () => {
    const [o, r] = await Promise.all([request("/api/admin/overview"), request("/api/admin/booking-requests")]);
    o.appointments = sortBookings(o.appointments || []);
    setOverview(o);
    setRequests(sortBookings(r.bookings || []));
  }, [request]);

  const loadSchedule = useCallback(async () => {
    const [b, st] = await Promise.all([request("/api/admin/bookings?days=14"), request("/api/admin/settings")]);
    setBookings(sortBookings(b.bookings || []));
    setSettings(st.settings || null);
    setServices(st.services || []);
  }, [request]);

  const loadSettings = useCallback(async () => {
    const st = await request("/api/admin/settings");
    setSettings(st.settings || null);
    setServices(st.services || []);
  }, [request]);

  const loadCurrent = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError("");
    try {
      if (tab === "home") await loadHome();
      if (tab === "schedule") await loadSchedule();
      if (tab === "insights") setInsights(await request(`/api/admin/insights?period=${insightPeriod}`));
      if (tab === "clients" && !clientDetail) setClients((await request("/api/admin/clients")).clients || []);
      if (tab === "settings") await loadSettings();
    } catch (err) { setError(err.message || "Could not load live admin data."); }
    finally { setLoading(false); }
  }, [token, tab, insightPeriod, clientDetail, loadHome, loadSchedule, loadSettings, request]);

  useEffect(() => { loadCurrent(); }, [token, tab, insightPeriod]);

  const saveSettings = useCallback(async (patch) => {
    if (saving) return false;
    setSaving(true); setError(""); setSaved(false);
    try {
      const data = await request("/api/admin/settings", { method: "PUT", body: JSON.stringify(patch) });
      setSettings(data.settings || settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 1400);
      return true;
    } catch (err) { setError(err.message || "Settings could not be saved."); return false; }
    finally { setSaving(false); }
  }, [request, saving, settings]);

  const updateAutomation = (key, patch) => saveSettings({ automations: { [key]: { ...(settings?.automations?.[key] || {}), ...patch } } });
  const updateGrowth = (key, value) => saveSettings({ growth_settings: { [key]: value } });

  const logout = async () => {
    try { if (token) await fetch(`${API_URL}/api/admin/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }); } catch (_) {}
    await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
    setToken("");
    setDetailType("");
    if (onExit) onExit();
  };

  const updateBookingStatus = async (booking, status) => {
    if (!booking?.id || actionBusy) return;
    const run = async () => {
      setActionBusy(booking.id); setError("");
      try { await request(`/api/admin/bookings/${booking.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); await (tab === "home" ? loadHome() : loadSchedule()); }
      catch (err) { setError(err.message); }
      finally { setActionBusy(""); }
    };
    if (["cancelled", "no_show"].includes(status)) {
      Alert.alert(status === "no_show" ? "Mark No-Show?" : "Cancel Appointment?", status === "no_show" ? "This records a no-show and releases the slot." : "This cancels the appointment and releases the slot.", [{ text: "Keep Booking", style: "cancel" }, { text: "Continue", style: "destructive", onPress: run }]);
      return;
    }
    await run();
  };

  const createBlock = async (payload) => {
    setBlockBusy(true); setError("");
    try { const data = await request("/api/admin/blocked-time", { method: "POST", body: JSON.stringify(payload) }); setSettings(data.settings || settings); return true; }
    catch (err) { setError(err.message); return false; }
    finally { setBlockBusy(false); }
  };
  const deleteBlock = async (id) => {
    if (!id) return;
    setBlockBusy(true);
    try { const data = await request(`/api/admin/blocked-time/${id}`, { method: "DELETE" }); setSettings(data.settings || settings); }
    catch (err) { setError(err.message); }
    finally { setBlockBusy(false); }
  };

  const openClient = async (clientKey) => {
    setClientBusy(true); setError("");
    try { const data = await request(`/api/admin/clients/${encodeURIComponent(clientKey)}`); setClientDetail(data); setClientNotes(data.client?.notes || ""); }
    catch (err) { setError(err.message); }
    finally { setClientBusy(false); }
  };
  const updateClient = async (patch) => {
    if (!clientDetail?.client?.client_key || clientBusy) return false;
    setClientBusy(true);
    try {
      await request(`/api/admin/clients/${encodeURIComponent(clientDetail.client.client_key)}`, { method: "PUT", body: JSON.stringify(patch) });
      const data = await request(`/api/admin/clients/${encodeURIComponent(clientDetail.client.client_key)}`);
      setClientDetail(data); setClientNotes(data.client?.notes || ""); return true;
    } catch (err) { setError(err.message); return false; }
    finally { setClientBusy(false); }
  };

  const choose = (title, value, options, onChoose) => setPicker({ title, value, options, onChoose });
  const displayMinutes = (v) => Number(v) === 0 ? "No minimum" : Number(v) < 60 ? `${v} min` : Number(v) % 60 ? `${Math.floor(Number(v) / 60)}h ${Number(v) % 60}m` : `${Number(v) / 60} hr`;
  const displayHours = (v) => Number(v) === 0 ? "No minimum" : `${v} hr${Number(v) === 1 ? "" : "s"}`;

  const groupedBookings = useMemo(() => {
    const groups = {};
    bookings.forEach((b) => { const key = String(b.start_at || "").slice(0, 10); if (!groups[key]) groups[key] = []; groups[key].push(b); });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [bookings]);
  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => [c.name, c.phone, c.email, ...(c.tags || [])].some((v) => String(v || "").toLowerCase().includes(q)));
  }, [clients, clientSearch]);

  if (checking) return <SafeAreaView style={s.safe}><View style={s.center}><ActivityIndicator color={C.goldSoft} /></View></SafeAreaView>;
  if (!token) return <SafeAreaView style={s.safe}><View style={s.sessionLost}><Text style={s.sessionLostTitle}>Admin Session Ended</Text><Text style={s.sessionLostText}>Return to the normal QuincyFadez login screen and use your owner password again.</Text><Pressable onPress={onExit} style={s.primaryButton}><Text style={s.primaryButtonText}>RETURN TO LOGIN</Text></Pressable></View></SafeAreaView>;

  const renderHome = () => {
    const appointments = sortBookings(overview?.appointments || []);
    const next = overview?.next_booking;
    return <>
      <View style={s.heroAdmin}><View><Text style={s.eyebrow}>LIVE BUSINESS</Text><Text style={s.pageTitle}>Today At QuincyFadez.</Text><Text style={s.pageIntro}>Everything important in one place, with larger text and no hidden controls.</Text></View><View style={s.livePill}><View style={s.liveDot} /><Text style={s.liveText}>LIVE</Text></View></View>
      <View style={s.metricGrid}><Metric label="TODAY'S BOOKINGS" value={String(overview?.today_bookings ?? 0)} meta="Appointments today" /><Metric label="COMPLETED VALUE" value={money(overview?.today_revenue)} meta="Finished appointments" /><Metric label="NEW CLIENTS" value={String(overview?.new_clients ?? 0)} meta="First visits" /><Metric label="UTILISATION" value={overview?.utilisation_percent == null ? "—" : `${overview.utilisation_percent}%`} meta="Booked working time" /></View>
      {requests.length ? <View style={s.goldPanel}><SectionHeader eyebrow="BOOKING REQUESTS" title={`${requests.length} Awaiting Approval`} /><Text style={s.goldPanelText}>Requests are kept separate from confirmed appointments so your real schedule stays clear.</Text>{requests.map((b) => <AppointmentCard key={b.id} booking={b} onStatus={updateBookingStatus} busy={actionBusy} />)}</View> : null}
      <View style={s.panel}><SectionHeader eyebrow="NEXT UP" title={next ? `${fmtTime(next.start_at)} · ${next.customer_name || "Client"}` : "No Appointment Waiting"} />{next ? <AppointmentCard booking={next} /> : <Text style={s.emptyText}>Your next confirmed appointment will appear here.</Text>}</View>
      <View style={s.panel}><SectionHeader eyebrow="TODAY" title="Today's Schedule" right={<Text style={s.countText}>{appointments.length} BOOKINGS</Text>} />{appointments.length ? appointments.map((b) => <AppointmentCard key={b.id} booking={b} onStatus={updateBookingStatus} busy={actionBusy} />) : <Text style={s.emptyText}>No appointments today.</Text>}</View>
    </>;
  };

  const renderSchedule = () => <>
    <Text style={s.eyebrow}>SCHEDULE</Text><Text style={s.pageTitle}>Your Time, Clearly.</Text><Text style={s.pageIntro}>Appointments stay in chronological order. Working hours and blocked time live here too.</Text>
    <View style={s.segment}>{[["appointments", "Appointments"], ["hours", "Working Hours"], ["blocks", "Block Time"]].map(([key, label]) => <Pressable key={key} onPress={() => setScheduleMode(key)} style={[s.segmentItem, scheduleMode === key && s.segmentItemActive]}><Text style={[s.segmentText, scheduleMode === key && s.segmentTextActive]}>{label}</Text></Pressable>)}</View>
    {scheduleMode === "appointments" ? <View style={s.panel}><SectionHeader eyebrow="UPCOMING" title="Next 14 Days" right={<Text style={s.countText}>{bookings.length} BOOKINGS</Text>} />{groupedBookings.length ? groupedBookings.map(([dateKey, items]) => <View key={dateKey} style={s.dayGroup}><Text style={s.dayGroupTitle}>{fmtLongDate(`${dateKey}T12:00:00`)}</Text>{items.map((b) => <AppointmentCard key={b.id} booking={b} onStatus={updateBookingStatus} busy={actionBusy} />)}</View>) : <Text style={s.emptyText}>No appointments booked in this period.</Text>}</View> : null}
    {scheduleMode === "hours" ? <WorkingHours hours={settings?.weekly_hours || {}} saving={saving} onSave={(weekly_hours) => saveSettings({ weekly_hours })} /> : null}
    {scheduleMode === "blocks" ? <BlockTime settings={settings} busy={blockBusy} onCreate={createBlock} onDelete={deleteBlock} /> : null}
  </>;

  const renderInsights = () => <>
    <Text style={s.eyebrow}>INSIGHTS</Text><Text style={s.pageTitle}>See What Is Working.</Text><Text style={s.pageIntro}>Only real booking and completed-value data is shown.</Text>
    <View style={s.segment}>{[["day", "Day"], ["week", "Week"], ["month", "Month"]].map(([key, label]) => <Pressable key={key} onPress={() => setInsightPeriod(key)} style={[s.segmentItem, insightPeriod === key && s.segmentItemActive]}><Text style={[s.segmentText, insightPeriod === key && s.segmentTextActive]}>{label}</Text></Pressable>)}</View>
    {insights ? <><View style={s.metricGrid}><Metric label="BOOKINGS" value={String(insights.bookings ?? 0)} /><Metric label="COMPLETED VALUE" value={money(insights.revenue)} /><Metric label="NEW CLIENTS" value={String(insights.new_clients ?? 0)} /><Metric label="AVERAGE BOOKING" value={money(insights.average_booking_value)} /><Metric label="HOURS WORKED" value={`${insights.hours_worked ?? 0}h`} /><Metric label="UTILISATION" value={insights.utilisation_percent == null ? "—" : `${insights.utilisation_percent}%`} /><Metric label="CANCELLATIONS" value={String(insights.cancellations ?? 0)} /><Metric label="NO-SHOWS" value={String(insights.no_shows ?? 0)} /></View><View style={s.panel}><SectionHeader eyebrow="TOP SERVICE" title={insights.top_service || "No Completed Services Yet"} /><Text style={s.emptyText}>Range: {insights.start_date} → {insights.end_date}</Text></View></> : !loading ? <View style={s.panel}><Text style={s.emptyText}>No Insights Yet.</Text></View> : null}
  </>;

  const renderClients = () => {
    if (clientDetail?.client) return <><Pressable onPress={() => { setClientDetail(null); setClientNotes(""); }} style={s.backRow}><Text style={s.backText}>‹ Back To Clients</Text></Pressable><View style={s.clientHero}><View style={s.clientAvatar}><Text style={s.clientAvatarText}>{(clientDetail.client.name || "C").slice(0, 1).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={s.clientNameLarge}>{clientDetail.client.name || "Client"}</Text><Text style={s.clientContact}>{clientDetail.client.phone || "No phone"}</Text><Text style={s.clientContact}>{clientDetail.client.email || "No email"}</Text></View></View><View style={s.metricGrid}><Metric label="COMPLETED" value={String(clientDetail.client.completed_count || 0)} /><Metric label="COMPLETED VALUE" value={money(clientDetail.client.total_spend)} /><Metric label="NO-SHOWS" value={String(clientDetail.client.no_show_count || 0)} /><Metric label="CANCELLED" value={String(clientDetail.client.cancelled_count || 0)} /></View><View style={s.panel}><Text style={s.eyebrow}>PRIVATE CLIENT NOTES</Text><TextInput value={clientNotes} onChangeText={setClientNotes} multiline placeholder="Add anything useful for future appointments…" placeholderTextColor="#5C5851" style={s.notesInput} /><Pressable disabled={clientBusy} onPress={() => updateClient({ notes: clientNotes })} style={[s.primaryButton, clientBusy && s.disabled]}><Text style={s.primaryButtonText}>{clientBusy ? "SAVING…" : "SAVE NOTES"}</Text></Pressable></View><ClientManagementPanel client={clientDetail.client} busy={clientBusy} onUpdate={updateClient} /></>;
    return <><Text style={s.eyebrow}>CLIENTS</Text><Text style={s.pageTitle}>Your Client Book.</Text><Text style={s.pageIntro}>Search by name, phone, email or tag.</Text><View style={s.searchBox}><Text style={s.searchGlyph}>⌕</Text><TextInput value={clientSearch} onChangeText={setClientSearch} placeholder="Search clients" placeholderTextColor="#625F59" style={s.searchInput} /></View>{clientBusy ? <ActivityIndicator color={C.goldSoft} style={{ marginTop: 18 }} /> : null}{filteredClients.length ? filteredClients.map((c) => <Pressable key={c.client_key} onPress={() => openClient(c.client_key)} style={({ pressed }) => [s.clientRow, pressed && s.pressed]}><View style={s.clientAvatarSmall}><Text style={s.clientAvatarSmallText}>{(c.name || "C").slice(0, 1).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={s.clientName}>{c.name || "Client"}</Text><Text style={s.clientMeta}>{c.phone || c.email || "No contact saved"}</Text><Text style={s.clientStats}>{c.completed_count || 0} completed · {money(c.total_spend)} completed value{c.blocked ? " · Blocked" : ""}</Text></View><Text style={s.chevron}>›</Text></Pressable>) : <View style={s.panel}><Text style={s.emptyText}>{clientSearch ? "No matching clients." : "No clients yet."}</Text></View>}</>;
  };

  const renderSettings = () => {
    const automation = settings?.automations || {};
    const growth = settings?.growth_settings || {};
    return <>
      <View style={s.settingsTop}><View><Text style={s.eyebrow}>SETTINGS</Text><Text style={s.pageTitle}>Simple To Change.</Text></View>{saved ? <Text style={s.savedText}>✓ SAVED</Text> : null}</View><Text style={s.pageIntro}>Important values use dropdowns instead of endless + / − tapping.</Text>
      <SettingsGroup title="PROFILE"><SettingRow title="Profile" meta="Business and owner details" onPress={() => setDetailType("profile")} /><SettingRow title="Services" meta="Live pricing and durations" onPress={() => setDetailType("services")} /><SettingRow title="Location" meta="Address and map details" onPress={() => setDetailType("location")} /><SettingRow last title="Share Booking Link" meta="Share the direct QuincyFadez booking link" onPress={() => Share.share({ message: `Book QuincyFadez: ${BOOKING_LINK}` })} /></SettingsGroup>
      <SettingsGroup title="BOOKINGS"><SettingRow title="Working Hours" meta="Choose the days and times you work" onPress={() => { setTab("schedule"); setScheduleMode("hours"); }} /><SettingRow title="Slot Frequency" meta="How often appointment start times appear" right={<SelectButton disabled={saving} label={`${settings?.slot_interval_minutes ?? 15} min`} onPress={() => choose("Slot Frequency", settings?.slot_interval_minutes ?? 15, [5,10,15,20,30,45,60].map((v) => ({ value:v,label:`Every ${v} minutes` })), (v) => saveSettings({ slot_interval_minutes: v }))} />} /><SettingRow title="Minimum Notice" meta="How close to an appointment clients can book" right={<SelectButton disabled={saving} label={displayMinutes(settings?.minimum_notice_minutes ?? 60)} onPress={() => choose("Minimum Notice", settings?.minimum_notice_minutes ?? 60, [0,15,30,60,120,180,360,720,1440].map((v) => ({ value:v,label:displayMinutes(v) })), (v) => saveSettings({ minimum_notice_minutes: v }))} />} /><SettingRow title="Booking Horizon" meta="How far ahead clients can book" right={<SelectButton disabled={saving} label={`${settings?.booking_window_days ?? 60} days`} onPress={() => choose("Booking Horizon", settings?.booking_window_days ?? 60, [7,14,21,30,45,60,90,120,180].map((v) => ({ value:v,label:`${v} days` })), (v) => saveSettings({ booking_window_days: v }))} />} /><SettingRow title="Booking Approval" meta="Approve requests before they become confirmed" right={<Toggle value={Boolean(settings?.booking_approval_required)} disabled={saving} onChange={(v) => saveSettings({ booking_approval_required: v })} />} />{settings?.booking_approval_required ? <SettingRow title="Approval Expiry" meta="Automatically expire unanswered requests" right={<SelectButton disabled={saving} label={displayMinutes(settings?.booking_approval_expiry_minutes ?? 30)} onPress={() => choose("Approval Expiry", settings?.booking_approval_expiry_minutes ?? 30, [15,30,60,120,240,480,1440].map((v) => ({ value:v,label:displayMinutes(v) })), (v) => saveSettings({ booking_approval_expiry_minutes: v }))} />} /> : null}<SettingRow title="Waiting List" meta="Allow clients to join when no suitable time is available" right={<Toggle value={Boolean(settings?.waiting_list_enabled)} disabled={saving} onChange={(v) => saveSettings({ waiting_list_enabled: v })} />} /><SettingRow title="Cancellation Notice" meta="Minimum notice required for cancellation" right={<SelectButton disabled={saving} label={displayHours(settings?.cancellation_notice_hours ?? 12)} onPress={() => choose("Cancellation Notice", settings?.cancellation_notice_hours ?? 12, [0,1,2,4,6,12,24,48,72].map((v) => ({ value:v,label:displayHours(v) })), (v) => saveSettings({ cancellation_notice_hours: v }))} />} /><SettingRow last title="Reschedule Notice" meta="Minimum notice required to move a booking" right={<SelectButton disabled={saving} label={displayHours(settings?.reschedule_notice_hours ?? 12)} onPress={() => choose("Reschedule Notice", settings?.reschedule_notice_hours ?? 12, [0,1,2,4,6,12,24,48,72].map((v) => ({ value:v,label:displayHours(v) })), (v) => saveSettings({ reschedule_notice_hours: v }))} />} /></SettingsGroup>
      <SettingsGroup title="NOTIFICATIONS & AUTOMATIONS"><SettingRow title="Client Notifications" meta="Master switch for automatic client notifications" right={<Toggle value={Boolean(settings?.notifications_enabled)} disabled={saving} onChange={(v) => saveSettings({ notifications_enabled: v })} />} /><SettingRow title="Booking Confirmed" meta="Send an immediate confirmation" right={<Toggle value={Boolean(automation.booking_confirmed?.enabled)} disabled={saving || !settings?.notifications_enabled} onChange={(v) => updateAutomation("booking_confirmed", { enabled: v })} />} /><SettingRow title="Booking Reminder" meta={`${automation.booking_reminder?.timing_hours ?? 24} hours before the appointment`} right={<Toggle value={Boolean(automation.booking_reminder?.enabled)} disabled={saving || !settings?.notifications_enabled} onChange={(v) => updateAutomation("booking_reminder", { enabled: v })} />} />{automation.booking_reminder?.enabled ? <SettingRow title="Reminder Timing" meta="Choose when the reminder is sent" right={<SelectButton disabled={saving} label={`${automation.booking_reminder?.timing_hours ?? 24} hr`} onPress={() => choose("Reminder Timing", automation.booking_reminder?.timing_hours ?? 24, [1,2,4,6,12,24,48,72].map((v) => ({ value:v,label:`${v} hour${v===1?"":"s"} before` })), (v) => updateAutomation("booking_reminder", { timing_hours: v }))} />} /> : null}<SettingRow title="Rescheduled Booking" meta="Notify immediately when a booking moves" right={<Toggle value={Boolean(automation.rescheduled_booking?.enabled)} disabled={saving || !settings?.notifications_enabled} onChange={(v) => updateAutomation("rescheduled_booking", { enabled: v })} />} /><SettingRow title="Leave A Review" meta="Ask for a review after a completed appointment" right={<Toggle value={Boolean(automation.leave_a_review?.enabled)} disabled={saving || !settings?.notifications_enabled} onChange={(v) => updateAutomation("leave_a_review", { enabled: v })} />} /><SettingRow title="Waiting List Alerts" meta="Alert a waiting client when a suitable slot opens" right={<Toggle value={Boolean(automation.waiting_list_alert?.enabled)} disabled={saving || !settings?.notifications_enabled || !settings?.waiting_list_enabled} onChange={(v) => updateAutomation("waiting_list_alert", { enabled: v })} />} /><SettingRow title="Re-book Reminder" meta={`${automation.rebook_reminder?.timing_weeks ?? 3} weeks after the last visit`} right={<Toggle value={Boolean(automation.rebook_reminder?.enabled)} disabled={saving || !settings?.notifications_enabled} onChange={(v) => updateAutomation("rebook_reminder", { enabled: v })} />} />{automation.rebook_reminder?.enabled ? <SettingRow title="Re-book Timing" meta="Choose when to invite a client back" right={<SelectButton disabled={saving} label={`${automation.rebook_reminder?.timing_weeks ?? 3} weeks`} onPress={() => choose("Re-book Timing", automation.rebook_reminder?.timing_weeks ?? 3, [1,2,3,4,5,6].map((v) => ({ value:v,label:`${v} week${v===1?"":"s"}` })), (v) => updateAutomation("rebook_reminder", { timing_weeks: v }))} />} /> : null}<SettingRow last title="SMS Delivery" meta="Not connected yet — no fake SMS sends will be shown as successful" right={<View style={s.notLivePill}><Text style={s.notLiveText}>NOT LIVE</Text></View>} /></SettingsGroup>
      <SettingsGroup title="PAYMENTS"><SettingRow last title="Payment Methods, Deposits & Fees" meta="Open payment protection settings" onPress={() => setDetailType("payments")} /></SettingsGroup>
      <SettingsGroup title="BUSINESS & GROWTH"><SettingRow title="Client Subscriptions" meta="Memberships and client plans" onPress={() => setDetailType("subscriptions")} /><SettingRow title="Reviews" meta="Review flow and Google reviews" onPress={() => setDetailType("reviews")} right={<Toggle value={Boolean(growth.reviews_enabled)} disabled={saving} onChange={(v) => updateGrowth("reviews_enabled", v)} />} /><SettingRow title="Promotions" meta="Control whether promotions are active" onPress={() => setDetailType("promotions")} right={<Toggle value={Boolean(growth.promotions_enabled)} disabled={saving} onChange={(v) => updateGrowth("promotions_enabled", v)} />} /><SettingRow title="Referral Programme" meta="Control referral features" onPress={() => setDetailType("referral")} right={<Toggle value={Boolean(growth.referral_programme_enabled)} disabled={saving} onChange={(v) => updateGrowth("referral_programme_enabled", v)} />} /><SettingRow last title="Digital Business Card" meta="Share QuincyFadez contact details" onPress={() => setDetailType("card")} /></SettingsGroup>
      <SettingsGroup title="BUSINESS SETTINGS"><SettingRow title="Policies" meta="Booking, cancellation, lateness and payment wording" onPress={() => setDetailType("policies")} /><SettingRow last title="Block Time" meta="Holidays, breaks and closures" onPress={() => { setTab("schedule"); setScheduleMode("blocks"); }} /></SettingsGroup>
      <SettingsGroup title="ACCOUNT & HELP"><SettingRow title="Account" meta="Owner session and logout" onPress={() => setDetailType("account")} /><SettingRow title="Help & Support" meta="Quick support options" onPress={() => setDetailType("help")} /><SettingRow title="FAQs" meta="Common app and booking questions" onPress={() => setDetailType("faqs")} /><SettingRow last title="Send Feedback" meta="Capture feedback while testing" onPress={() => setDetailType("feedback")} /></SettingsGroup>
    </>;
  };

  let body = renderHome();
  if (tab === "schedule") body = renderSchedule();
  if (tab === "insights") body = renderInsights();
  if (tab === "clients") body = renderClients();
  if (tab === "settings") body = renderSettings();

  return <SafeAreaView style={s.safe}>
    <StatusBar barStyle="light-content" backgroundColor={C.bg} />
    <View style={s.shell}>
      <View style={s.header}><View><Text style={s.brand}>QUINCYFADEZ</Text><Text style={s.adminText}>OWNER WORKSPACE</Text></View><View style={s.headerRight}><View style={s.headerGoldDot} /><Text style={s.headerStatus}>CONNECTED</Text></View></View>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {loading ? <View style={s.loadingBar}><ActivityIndicator color={C.goldSoft} /><Text style={s.loadingText}>SYNCING LIVE DATA…</Text></View> : null}
        {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}
        {body}
      </ScrollView>
      <BottomNav tab={tab} setTab={(next) => { setTab(next); if (next !== "clients") setClientDetail(null); }} />
      <SelectModal picker={picker} close={() => setPicker(null)} />
      <DetailModal type={detailType} close={() => setDetailType("")} settings={settings} services={services} saving={saving} saveSettings={saveSettings} logout={logout} />
    </View>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:C.bg},shell:{flex:1,backgroundColor:C.bg},scroll:{flex:1},content:{paddingHorizontal:18,paddingTop:16,paddingBottom:28},center:{flex:1,alignItems:"center",justifyContent:"center"},pressed:{opacity:.72},disabled:{opacity:.45},rowPressed:{backgroundColor:"rgba(214,189,122,.035)"},
  header:{minHeight:72,paddingHorizontal:18,borderBottomWidth:1,borderBottomColor:C.borderSoft,flexDirection:"row",alignItems:"center",justifyContent:"space-between",backgroundColor:C.bg},brand:{color:C.text,fontSize:18,letterSpacing:3.2,fontWeight:"900"},adminText:{color:C.gold,fontSize:9,letterSpacing:1.7,fontWeight:"800",marginTop:4},headerRight:{height:34,borderRadius:17,borderWidth:1,borderColor:C.border,backgroundColor:C.surface,flexDirection:"row",alignItems:"center",paddingHorizontal:11,gap:7},headerGoldDot:{width:7,height:7,borderRadius:4,backgroundColor:C.gold},headerStatus:{color:C.goldSoft,fontSize:8,fontWeight:"900",letterSpacing:.8},
  heroAdmin:{flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between",gap:12},eyebrow:{color:C.gold,fontSize:10,letterSpacing:1.5,fontWeight:"900"},pageTitle:{color:C.text,fontSize:29,lineHeight:34,fontWeight:"850",marginTop:7},pageIntro:{color:C.muted,fontSize:13,lineHeight:19,marginTop:8,maxWidth:345},livePill:{borderRadius:14,borderWidth:1,borderColor:C.border,backgroundColor:C.surface2,paddingHorizontal:10,paddingVertical:8,flexDirection:"row",alignItems:"center",gap:6},liveDot:{width:7,height:7,borderRadius:4,backgroundColor:C.gold},liveText:{color:C.goldSoft,fontSize:8,fontWeight:"900"},
  metricGrid:{flexDirection:"row",flexWrap:"wrap",gap:9,marginTop:18},metric:{width:"48.6%",minHeight:112,borderRadius:18,borderWidth:1,borderColor:C.border,backgroundColor:C.surface,padding:15,justifyContent:"center"},metricLabel:{color:C.gold,fontSize:9,letterSpacing:.9,fontWeight:"900"},metricValue:{color:C.text,fontSize:25,fontWeight:"850",marginTop:7},metricMeta:{color:C.muted,fontSize:10,lineHeight:14,marginTop:5},
  panel:{marginTop:16,borderRadius:22,borderWidth:1,borderColor:C.border,backgroundColor:C.surface,padding:16},goldPanel:{marginTop:16,borderRadius:22,borderWidth:1,borderColor:"#5B4723",backgroundColor:C.surface2,padding:16,shadowColor:C.gold,shadowOpacity:.08,shadowRadius:14,shadowOffset:{width:0,height:6}},goldPanelText:{color:C.muted,fontSize:12,lineHeight:18,marginTop:7},sectionHeader:{flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between",gap:12},sectionHeaderCopy:{flex:1},sectionTitle:{color:C.text,fontSize:20,lineHeight:24,fontWeight:"800",marginTop:4},countText:{color:C.goldSoft,fontSize:9,fontWeight:"900",marginTop:3},emptyText:{color:C.muted,fontSize:12,lineHeight:18,marginTop:12},
  appointmentCard:{marginTop:11,borderRadius:17,borderWidth:1,borderColor:C.borderSoft,backgroundColor:"#0A0907",padding:13},appointmentTop:{flexDirection:"row",alignItems:"center",gap:12},timeBlock:{width:58},bookingTime:{color:C.goldSoft,fontSize:18,fontWeight:"900"},durationText:{color:C.muted2,fontSize:8,letterSpacing:.7,fontWeight:"800",marginTop:4},appointmentCopy:{flex:1},bookingName:{color:C.text,fontSize:15,fontWeight:"800"},bookingService:{color:C.text2,fontSize:12,marginTop:3},bookingMeta:{color:C.muted,fontSize:10,marginTop:4},statusPill:{borderRadius:12,borderWidth:1,borderColor:C.border,paddingHorizontal:8,paddingVertical:6,backgroundColor:C.surface2},statusPending:{borderColor:"#6A4E22"},statusCompleted:{borderColor:"#33523D",backgroundColor:"#0B150E"},statusText:{color:C.goldSoft,fontSize:7,fontWeight:"900",letterSpacing:.6},bookingActions:{flexDirection:"row",gap:7,marginTop:11,paddingTop:11,borderTopWidth:1,borderTopColor:C.borderSoft},primarySmall:{flex:1,minHeight:40,borderRadius:11,backgroundColor:C.gold,alignItems:"center",justifyContent:"center"},primarySmallText:{color:"#090909",fontSize:8,fontWeight:"900"},secondarySmall:{flex:1,minHeight:40,borderRadius:11,borderWidth:1,borderColor:"#3A3833",alignItems:"center",justifyContent:"center"},secondarySmallText:{color:C.text2,fontSize:8,fontWeight:"900"},dangerSmall:{flex:1,minHeight:40,borderRadius:11,borderWidth:1,borderColor:"#56302B",backgroundColor:C.dangerBg,alignItems:"center",justifyContent:"center"},dangerSmallText:{color:C.danger,fontSize:8,fontWeight:"900"},
  segment:{flexDirection:"row",gap:7,marginTop:18,marginBottom:2,borderRadius:16,borderWidth:1,borderColor:C.borderSoft,backgroundColor:"#090909",padding:4},segmentItem:{flex:1,minHeight:45,borderRadius:12,alignItems:"center",justifyContent:"center",paddingHorizontal:4},segmentItemActive:{backgroundColor:C.surface3,borderWidth:1,borderColor:"#5A4724"},segmentText:{color:C.muted,fontSize:10,fontWeight:"800"},segmentTextActive:{color:C.goldSoft},dayGroup:{marginTop:18},dayGroupTitle:{color:C.gold,fontSize:11,fontWeight:"900",letterSpacing:.7,marginBottom:3},
  managerCard:{marginTop:16,borderRadius:22,borderWidth:1,borderColor:C.border,backgroundColor:C.surface,padding:16},managerHelp:{color:C.muted,fontSize:12,lineHeight:18,marginTop:8,marginBottom:8},goldSave:{minHeight:38,borderRadius:11,backgroundColor:C.gold,paddingHorizontal:15,alignItems:"center",justifyContent:"center"},goldSaveText:{color:"#090909",fontSize:9,fontWeight:"900"},dayCard:{marginTop:10,borderRadius:16,borderWidth:1,borderColor:C.borderSoft,backgroundColor:"#090807",padding:13},dayHead:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},dayName:{color:C.text,fontSize:15,fontWeight:"800"},dayMeta:{color:C.muted,fontSize:9,fontWeight:"700",marginTop:4},toggle:{width:48,height:28,borderRadius:14,backgroundColor:"#2B2A27",padding:3,justifyContent:"center"},toggleOn:{backgroundColor:C.gold},toggleKnob:{width:22,height:22,borderRadius:11,backgroundColor:"#817D77"},toggleKnobOn:{alignSelf:"flex-end",backgroundColor:"#090909"},windowRow:{flexDirection:"row",alignItems:"flex-end",gap:8,marginTop:12},timeField:{flex:1},inputLabel:{color:C.gold,fontSize:9,letterSpacing:.8,fontWeight:"900",marginBottom:6},timeInput:{height:50,borderRadius:12,borderWidth:1,borderColor:C.borderSoft,backgroundColor:"#0D0C0A",color:C.text,fontSize:15,fontWeight:"700",paddingHorizontal:12},timeDash:{color:C.muted,fontSize:18,paddingBottom:14},removeButton:{width:34,height:50,alignItems:"center",justifyContent:"center"},removeText:{color:C.danger,fontSize:22},addWindow:{minHeight:40,marginTop:10,borderRadius:11,borderWidth:1,borderColor:C.border,alignItems:"center",justifyContent:"center"},addWindowText:{color:C.goldSoft,fontSize:8,fontWeight:"900",letterSpacing:.5},
  bigInput:{minHeight:54,borderRadius:14,borderWidth:1,borderColor:C.borderSoft,backgroundColor:"#0B0A08",color:C.text,fontSize:14,paddingHorizontal:14,marginTop:9},multilineInput:{minHeight:110,textAlignVertical:"top",paddingTop:14},twoInputs:{flexDirection:"row",gap:9},halfInput:{flex:1},primaryButton:{minHeight:56,borderRadius:15,backgroundColor:C.gold,alignItems:"center",justifyContent:"center",marginTop:14,shadowColor:C.gold,shadowOpacity:.12,shadowRadius:12,shadowOffset:{width:0,height:5}},primaryButtonText:{color:"#090909",fontSize:10,letterSpacing:.8,fontWeight:"900"},listLabel:{color:C.gold,fontSize:9,letterSpacing:1,fontWeight:"900",marginTop:22},blockRow:{minHeight:70,borderRadius:14,borderWidth:1,borderColor:C.borderSoft,backgroundColor:"#0A0907",padding:12,flexDirection:"row",alignItems:"center",gap:10,marginTop:9},blockTitle:{color:C.text,fontSize:13,fontWeight:"800"},blockMeta:{color:C.muted,fontSize:10,marginTop:4},removeBlock:{borderRadius:10,borderWidth:1,borderColor:"#55322C",paddingHorizontal:9,paddingVertical:8},removeBlockText:{color:C.danger,fontSize:7,fontWeight:"900"},
  searchBox:{minHeight:56,borderRadius:16,borderWidth:1,borderColor:C.border,backgroundColor:C.surface,flexDirection:"row",alignItems:"center",gap:10,paddingHorizontal:14,marginTop:18},searchGlyph:{color:C.gold,fontSize:20},searchInput:{flex:1,color:C.text,fontSize:14},clientRow:{minHeight:86,borderRadius:17,borderWidth:1,borderColor:C.borderSoft,backgroundColor:C.surface,marginTop:9,padding:13,flexDirection:"row",alignItems:"center",gap:12},clientAvatarSmall:{width:46,height:46,borderRadius:23,borderWidth:1,borderColor:"#594723",backgroundColor:C.surface2,alignItems:"center",justifyContent:"center"},clientAvatarSmallText:{color:C.goldSoft,fontSize:18,fontWeight:"900"},clientName:{color:C.text,fontSize:15,fontWeight:"800"},clientMeta:{color:C.text2,fontSize:11,marginTop:3},clientStats:{color:C.muted,fontSize:9,marginTop:5},chevron:{color:C.goldSoft,fontSize:24,fontWeight:"500"},backRow:{paddingVertical:8,alignSelf:"flex-start"},backText:{color:C.goldSoft,fontSize:12,fontWeight:"800"},clientHero:{marginTop:8,borderRadius:20,borderWidth:1,borderColor:C.border,backgroundColor:C.surface2,padding:16,flexDirection:"row",alignItems:"center",gap:14},clientAvatar:{width:62,height:62,borderRadius:31,borderWidth:1,borderColor:"#695328",backgroundColor:C.surface3,alignItems:"center",justifyContent:"center"},clientAvatarText:{color:C.goldSoft,fontSize:24,fontWeight:"900"},clientNameLarge:{color:C.text,fontSize:23,fontWeight:"850"},clientContact:{color:C.muted,fontSize:11,marginTop:4},notesInput:{minHeight:120,borderRadius:14,borderWidth:1,borderColor:C.borderSoft,backgroundColor:"#090807",color:C.text,fontSize:13,lineHeight:18,textAlignVertical:"top",padding:13,marginTop:10},
  settingsTop:{flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between"},savedText:{color:C.goldSoft,fontSize:10,fontWeight:"900",letterSpacing:.8,marginTop:6},settingsGroup:{marginTop:21},settingsGroupTitle:{color:C.gold,fontSize:10,letterSpacing:1.3,fontWeight:"900",marginBottom:8},settingsCard:{borderRadius:19,borderWidth:1,borderColor:C.border,backgroundColor:C.surface,overflow:"hidden"},settingRow:{minHeight:78,paddingHorizontal:15,paddingVertical:13,flexDirection:"row",alignItems:"center",gap:12},settingBorder:{borderBottomWidth:1,borderBottomColor:C.borderSoft},settingCopy:{flex:1},settingName:{color:C.text,fontSize:14,fontWeight:"800"},settingMeta:{color:C.muted,fontSize:10.5,lineHeight:15,marginTop:4},settingRight:{alignItems:"flex-end",justifyContent:"center"},selectButton:{minWidth:102,minHeight:40,borderRadius:12,borderWidth:1,borderColor:"#4B3D22",backgroundColor:C.surface2,paddingHorizontal:10,flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:8},selectButtonText:{color:C.goldSoft,fontSize:10,fontWeight:"800"},selectArrow:{color:C.goldSoft,fontSize:16},notLivePill:{borderRadius:10,borderWidth:1,borderColor:"#46322D",backgroundColor:"#120D0B",paddingHorizontal:9,paddingVertical:7},notLiveText:{color:C.danger,fontSize:7,fontWeight:"900",letterSpacing:.6},
  modalBackdrop:{flex:1,backgroundColor:"rgba(0,0,0,.72)",justifyContent:"flex-end"},selectSheet:{maxHeight:"70%",borderTopLeftRadius:24,borderTopRightRadius:24,borderWidth:1,borderColor:C.border,backgroundColor:"#0B0A08",paddingTop:10,paddingHorizontal:18,paddingBottom:24},sheetHandle:{width:46,height:4,borderRadius:2,backgroundColor:"#4B463E",alignSelf:"center",marginBottom:18},sheetEyebrow:{color:C.gold,fontSize:9,letterSpacing:1.1,fontWeight:"900"},sheetTitle:{color:C.text,fontSize:24,fontWeight:"850",marginTop:5},selectOptions:{marginTop:14},selectOptionsContent:{paddingBottom:10},optionRow:{minHeight:54,borderRadius:13,borderWidth:1,borderColor:C.borderSoft,backgroundColor:C.surface,marginTop:7,paddingHorizontal:14,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},optionRowActive:{borderColor:"#6A5429",backgroundColor:C.surface3},optionText:{color:C.text2,fontSize:13,fontWeight:"700"},optionTextActive:{color:C.goldSoft},optionCheck:{color:C.goldSoft,fontSize:16,fontWeight:"900"},
  detailSafe:{flex:1,backgroundColor:C.bg},detailHeader:{minHeight:76,paddingHorizontal:18,borderBottomWidth:1,borderBottomColor:C.borderSoft,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},detailEyebrow:{color:C.gold,fontSize:9,letterSpacing:1.2,fontWeight:"900"},detailTitle:{color:C.text,fontSize:24,fontWeight:"850",marginTop:4},closeButton:{width:44,height:44,borderRadius:22,borderWidth:1,borderColor:C.border,backgroundColor:C.surface,alignItems:"center",justifyContent:"center"},closeText:{color:C.goldSoft,fontSize:27,lineHeight:28},detailContent:{paddingHorizontal:18,paddingTop:16,paddingBottom:44},detailHelp:{color:C.muted,fontSize:13,lineHeight:19},detailNote:{color:C.muted,fontSize:11.5,lineHeight:18,marginTop:14},fieldWrap:{marginTop:12},serviceSetting:{minHeight:72,borderRadius:15,borderWidth:1,borderColor:C.borderSoft,backgroundColor:C.surface,paddingHorizontal:14,marginTop:9,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},serviceSettingName:{color:C.text,fontSize:15,fontWeight:"800"},serviceSettingMeta:{color:C.muted,fontSize:10,marginTop:4},serviceSettingPrice:{color:C.goldSoft,fontSize:18,fontWeight:"900"},infoCard:{borderRadius:18,borderWidth:1,borderColor:C.border,backgroundColor:C.surface,padding:16,marginTop:8},infoCardTitle:{color:C.text,fontSize:18,fontWeight:"850"},infoCardText:{color:C.muted,fontSize:12.5,lineHeight:19,marginTop:7},dangerButton:{minHeight:56,borderRadius:15,borderWidth:1,borderColor:"#63372F",backgroundColor:C.dangerBg,alignItems:"center",justifyContent:"center",marginTop:14},dangerButtonText:{color:C.danger,fontSize:10,fontWeight:"900",letterSpacing:.8},faq:{borderRadius:17,borderWidth:1,borderColor:C.borderSoft,backgroundColor:C.surface,padding:15,marginTop:10},faqQ:{color:C.text,fontSize:14,fontWeight:"800"},faqA:{color:C.muted,fontSize:12,lineHeight:18,marginTop:6},
  navSafe:{backgroundColor:C.bg},navShell:{minHeight:72,marginHorizontal:10,marginTop:6,marginBottom:7,borderRadius:24,borderWidth:1,borderColor:C.border,backgroundColor:"#0A0907",flexDirection:"row",padding:5,shadowColor:"#000",shadowOpacity:.28,shadowRadius:14,shadowOffset:{width:0,height:-5}},navItem:{flex:1,minHeight:60,borderRadius:18,alignItems:"center",justifyContent:"center",gap:5},navItemActive:{backgroundColor:C.surface3,borderWidth:1,borderColor:"#564522"},navLabel:{color:"#817D76",fontSize:9.5,fontWeight:"700"},navLabelActive:{color:C.goldSoft,fontWeight:"900"},homeGlyph:{width:21,height:19,borderRadius:5,borderWidth:1.8,alignItems:"center",justifyContent:"center"},homeGlyphDot:{width:5,height:5,borderRadius:3},calendarGlyph:{width:22,height:20,borderRadius:5,borderWidth:1.8,overflow:"hidden"},calendarTop:{height:4,width:"100%"},calendarDots:{flex:1,flexDirection:"row",alignItems:"center",justifyContent:"space-around",paddingHorizontal:3},calendarDot:{width:3,height:3,borderRadius:2},barsGlyph:{height:20,width:22,flexDirection:"row",alignItems:"flex-end",justifyContent:"space-between",paddingHorizontal:1},bar1:{width:5,height:8,borderRadius:2},bar2:{width:5,height:14,borderRadius:2},bar3:{width:5,height:20,borderRadius:2},clientsGlyph:{width:23,height:21,alignItems:"center"},personHead:{width:9,height:9,borderRadius:5,borderWidth:1.8},personBody:{width:20,height:10,borderTopLeftRadius:9,borderTopRightRadius:9,borderWidth:1.8,borderBottomWidth:0,marginTop:2},settingsGlyph:{width:22,height:20,justifyContent:"space-around"},settingLine:{height:2,borderRadius:1,width:22},settingLineShort:{height:2,borderRadius:1,width:14,alignSelf:"flex-end"},
  loadingBar:{minHeight:48,borderRadius:14,borderWidth:1,borderColor:C.borderSoft,backgroundColor:C.surface,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:9,marginBottom:12},loadingText:{color:C.goldSoft,fontSize:9,fontWeight:"900",letterSpacing:.7},errorBox:{borderRadius:14,borderWidth:1,borderColor:"#5A312B",backgroundColor:C.dangerBg,padding:12,marginBottom:12},errorText:{color:C.danger,fontSize:11.5,lineHeight:17},sessionLost:{flex:1,padding:24,alignItems:"center",justifyContent:"center"},sessionLostTitle:{color:C.text,fontSize:27,fontWeight:"850"},sessionLostText:{color:C.muted,fontSize:13,lineHeight:19,textAlign:"center",marginTop:9,maxWidth:330},
});
