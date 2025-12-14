import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const SelectContext = React.createContext<any>(null);

const Select = ({ children, defaultValue, value: controlledValue, onValueChange, ...props }: any) => {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [labels, setLabels] = React.useState<Map<string, any>>(new Map());

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const handleSelect = (newValue: string) => {
        if (!isControlled) {
            setInternalValue(newValue);
        }
        if (onValueChange) onValueChange(newValue);
        setOpen(false);
    };

    const registerLabel = React.useCallback((value: string, label: any) => {
        setLabels(prev => {
            const newLabels = new Map(prev);
            newLabels.set(value, label);
            return newLabels;
        });
    }, []);

    return (
        <SelectContext.Provider value={{ value, onSelect: handleSelect, open, setOpen, labels, registerLabel }}>
            <div className="relative inline-block w-full" {...props}>
                {children}
            </div>
        </SelectContext.Provider>
    )
}

const SelectTrigger = ({ className, children, ...props }: any) => {
    const { open, setOpen } = React.useContext(SelectContext);
    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
}

const SelectValue = ({ placeholder }: any) => {
    const { value, labels } = React.useContext(SelectContext);
    const label = labels.get(value);
    return <span className="pointer-events-none truncate">{label || value || placeholder}</span>
}

const SelectContent = ({ className, children, ...props }: any) => {
    const { open } = React.useContext(SelectContext);
    // Always render children to allow registration, but hide if not open
    return (
        <div className={cn(
            "absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 mt-1 bg-white dark:bg-slate-950",
            !open && "hidden",
            className
        )} {...props}>
            <div className="p-1">
                {children}
            </div>
        </div>
    )
}

const SelectItem = ({ className, children, value, ...props }: any) => {
    const { onSelect, registerLabel } = React.useContext(SelectContext);

    React.useEffect(() => {
        registerLabel(value, children);
    }, [value, children, registerLabel]);

    return (
        <div
            className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground cursor-pointer", className)}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(value);
            }}
            {...props}
        >
            <span className="truncate">{children}</span>
        </div>
    )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
