import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogClose,
  DialogFooter,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { invoiceStateAtom } from "@/Atoms/atoms";
import { useAtomValue } from "jotai";
import { toast } from "sonner";

interface DialogSearchProps {
  table: string;
  field: string;
  show: boolean;
  setShow: (show: boolean) => void;
  setData: (any: any) => void;
  fields: string[];
  focusOnClose?: HTMLElement | null;
  message?: string;
}

export type SearchResults = {
  [key: string]: string;
};

export default function DialogSearch({
  table,
  field,
  show,
  setShow,
  setData,
  fields,
  focusOnClose,
  message
}: DialogSearchProps) {
  const [searchResults, setSearchResults] = useState<SearchResults[]>([]);
  const [searchField, setSearchField] = useState("");

  const invoiceState = useAtomValue(invoiceStateAtom);
  const invoiceStateRef = useRef(invoiceState);

  useEffect(() => {
    invoiceStateRef.current = invoiceState;
  });
  
  const search = async () => {
    if (searchField === "") return;
    const body = {
      table: table,
      field: field,
      value: searchField,
    };
    const response = await fetch("http://127.0.0.1:5000/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log(data);
    setSearchResults(data["result"]);
  };

  useEffect(() => {
    if (show) {
      setSearchField("");
      setSearchResults([]);
    }
    if (!show) {
      focusOnClose?.focus();
    }
    console.log(focusOnClose)
  }, [show]);

  return (
    <>
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="w-full max-w-3xl max-h-dvh overflow-y-auto">
          <DialogHeader>
            
          </DialogHeader>
            <div className="flex gap-2">
              <input
                type="text"
                ref={(input) => {
                  if (input) {
                    input.focus();
                  }
                }}
                className="h-8 w-full rounded-md border px-2 inline"
                placeholder={message ? message: `Buscar ${table} por ${field}...`}
                value={searchField}
                onChange={(e) => {
                  setSearchField(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    search();
                  }
                }}
              />
              <button
                onClick={() => {
                  search();
                }}
                className="border rounded-md p-2 h-8 hover:bg-slate-100 transition-all flex items-center"
              >
                Buscar
              </button>
            </div>
              <div id="results" className="flex-1 border overflow-y-auto h-72 rounded-md">
                {/* headers */}
                <div className="flex flex-row gap-2 p-2 justify-around items-center bg-slate-200">
                  {fields &&
                    fields.map((field) => {
                      if (field === "photourl"){
                        return (
                          <p key={field} className="text-sm">
                            FOTO
                          </p>
                        );
                      } 
                      if (field === "pid_prefix") {
                        return null;
                      }
                      return (
                        <p key={field} className="text-sm">
                          {field.toUpperCase()}
                        </p>
                      );
                    })}
                  <p className="text-sm">Seleccionar</p>
                </div>
                {searchResults.map((result: SearchResults, index) => {
                  return (
                    <div
                      key={index}
                      className="flex flex-row gap-2 p-2 justify-around items-center hover:bg-slate-100 transition-all"
                    >
                      {fields &&
                        fields.map((field) => {
                          if (field === "photourl"){
                            return (
                              <img key={field} className="h-8 w-8" src={result[field]} alt="imagen" />
                            );
                          }
                          if (field === "pid_prefix") {
                            return null;
                          }
                          if (field === "pid") {
                            return (
                              <p key={field} className="text-sm">
                              {result['pid_prefix']}-{result["pid"]}
                            </p>
                            )
                          }
                          return (
                            <p key={field} className="text-sm">
                              {result[field]}
                            </p>
                          );
                        })}
                      <button
                        onClick={() => {
                          
                          if (invoiceStateRef.current === "draft" ) setData(result);
                          else {
                            toast.error("No puedes modificar una factura finalizada o anulada");
                          }
                          setShow(false);
                          setSearchResults([]);
                          if (focusOnClose) {
                            focusOnClose.focus();
                          }
                        }}
                        ref={(button) => {
                          if (index === 0 && button) {
                            button.focus();
                          }
                        }}
                        className="border rounded-md p-2 hover:bg-slate-100 transition-all"
                      >
                        Seleccionar
                      </button>
                    </div>
                  );
                })}
              </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={() => {
                setSearchResults([]);
              }}>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}
