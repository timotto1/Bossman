import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { TableFormData } from "./table-form";
import { Loader } from "@/components/loader";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface TenantUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function TableFormStep3() {
  const form = useFormContext<TableFormData>();

  const { user } = useUser();

  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getPlatformTenantUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc(`platform_tenant_users`, {
        company_param: user?.companyID,
      });

      if (error) throw new Error(error.message);

      setTenantUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const renderPermissionSelector = (mode: "view" | "edit") => {
    return (
      <>
        <h6 className="text-sm text-[#26045D]">
          Select users who can {mode} this table:
        </h6>
        <div className="flex items-center gap-2">
          <FormField
            control={form.control}
            name={`step_3.${mode}.type`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    defaultValue={field.value}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue(`step_3.${mode}.userId`, undefined);
                    }}
                    className="flex gap-2"
                  >
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="all" className="peer sr-only" />
                      </FormControl>
                      <FormLabel className="text-muted-foreground text-center py-1 px-2 border text-sm h-[28px] w-[180px] justify-start rounded-[12px] border-[#D6D5D7] cursor-pointer peer-aria-checked:border-[#26045D] peer-aria-checked:text-[#26045D] font-normal">
                        All
                      </FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="none" className="peer sr-only" />
                      </FormControl>
                      <FormLabel className="text-muted-foreground text-center py-1 px-2 border text-sm h-[28px] w-[180px] justify-start rounded-[12px] border-[#D6D5D7] cursor-pointer peer-aria-checked:border-[#26045D] peer-aria-checked:text-[#26045D] font-normal">
                        None
                      </FormLabel>
                    </FormItem>
                    <FormItem className="hidden">
                      <FormControl>
                        <RadioGroupItem value="user" className="peer sr-only" />
                      </FormControl>
                      <FormLabel className="text-muted-foreground text-center py-1 px-2 border text-sm h-[28px] w-[180px] justify-start rounded-[12px] border-[#D6D5D7] cursor-pointer peer-aria-checked:border-[#26045D] peer-aria-checked:text-[#26045D] font-normal">
                        User
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`step_3.${mode}.userId`}
            render={({ field }) => {
              const type = form.watch(`step_3.${mode}.type`);

              return (
                <FormItem>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue(`step_3.${mode}.type`, "user");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          "rounded-[12px] text-sm h-7 border",
                          type === "user"
                            ? "border-[#26045D] text-[#26045D]"
                            : "border-[#D6D5D7] text-[#B9B7BD]",
                        )}
                      >
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tenantUsers?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {`${user.first_name} ${user.last_name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              );
            }}
          />
        </div>
      </>
    );
  };

  useEffect(() => {
    getPlatformTenantUsers();
  }, [getPlatformTenantUsers]);

  return (
    <div>
      <div className="flex items-center justify-end">
        <div className="bg-[#E5DAFB] h-[28px] rounded-full text-[#7114E2] mb-[50px] px-3 py-1">
          {form.watch("step_1.name")}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1">
          <div className="lg:max-w-[220px] space-y-6">
            <h3 className="text-xl font-medium text-[#26045D]">
              Choose permissions
            </h3>
            <p className="text-[#87858E] text-sm">
              Allocate who can view and edit this table.
            </p>
          </div>
        </div>
        {isLoading ? (
          <div className="col-span-2 flex items-center justify-center min-h-[300px]">
            <Loader />
          </div>
        ) : (
          <div className="col-span-2 border border-[#D6D5D7] p-4 rounded-[12px] space-y-3 h-[300px] overflow-y-auto">
            {renderPermissionSelector("view")}
            {renderPermissionSelector("edit")}
          </div>
        )}
      </div>
    </div>
  );
}
