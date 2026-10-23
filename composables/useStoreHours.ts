import { ref, onMounted, onBeforeUnmount } from "vue";
import { businessInfo } from "~/constants/business";
import { holidayOn } from "~~/shared/holidays";

type Day = keyof typeof businessInfo.business_hours.full_week;

const TIME_ZONE = "America/Vancouver";

// Minutes past midnight for a time like "9:00 AM"
function toMinutes(time: string) {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  const [, hour, minute, period] = match;
  const isPm = period.toUpperCase() === "PM";
  return ((Number(hour) % 12) + (isPm ? 12 : 0)) * 60 + Number(minute);
}

// The date and time at the pharmacy, whatever the visitor's own time zone
function storeNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)?.value;

  return {
    date: {
      year: Number(part("year")),
      month: Number(part("month")),
      day: Number(part("day")),
    },
    day: part("weekday")!.toLowerCase() as Day,
    minutes: Number(part("hour")) * 60 + Number(part("minute")),
  };
}

// Today's opening hours, whether the pharmacy is open right now, and the
// holiday it's closed for, if any. All stay null until mounted: pages are
// prerendered, so anything worked out on the server would be for the build
// time, not the visitor's. On a holiday, today is "holidays", so lists of the
// week's hours highlight that row instead of the weekday
export function useStoreHours() {
  const hours = businessInfo.business_hours.full_week;
  const today = ref<Day | null>(null);
  const isOpen = ref<boolean | null>(null);
  const holiday = ref<string | null>(null);

  let timer: ReturnType<typeof setInterval> | undefined;

  const update = () => {
    const { date, day: weekday, minutes } = storeNow();
    const closedFor = holidayOn(date, businessInfo.business_hours.holidays);
    const day: Day = closedFor ? "holidays" : weekday;
    const [opens, closes] = hours[day].split("-").map(toMinutes);

    holiday.value = closedFor?.name ?? null;
    today.value = day;
    isOpen.value =
      opens != null && closes != null && minutes >= opens && minutes < closes;
  };

  onMounted(() => {
    update();
    // Flip the status at opening and closing time on a page left open
    timer = setInterval(update, 60_000);
  });
  onBeforeUnmount(() => clearInterval(timer));

  return { hours, today, isOpen, holiday };
}
