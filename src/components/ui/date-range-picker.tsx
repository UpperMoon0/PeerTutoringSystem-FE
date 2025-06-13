"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  className?: string;
}

export function DatePickerWithRange({
  date,
  onDateChange,
  className,
}: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 hover:bg-gray-700 hover:text-white text-white",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700 text-white" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            className="bg-gray-900"
            classNames={{
              day_selected: "bg-blue-600 text-white hover:bg-blue-500 focus:bg-blue-500",
              day_today: "bg-gray-700 text-white",
              day_range_middle: "aria-selected:bg-blue-700 aria-selected:text-white",
              caption_label: "text-white",
              nav_button: "text-white hover:bg-gray-700",
              head_cell: "text-gray-400",
              day: "text-white hover:bg-gray-700 rounded-md",
              
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}