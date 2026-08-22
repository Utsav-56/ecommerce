'use client'
import { PlusIcon, CheckCircle2Icon } from "lucide-react"

export default function AddressSelector({ addressList, selectedAddress, setSelectedAddress, setShowAddressModal }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-between">
        Shipping Address
        <button
          type="button"
          onClick={() => setShowAddressModal(true)}
          className="text-xs text-primary hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <PlusIcon size={14} /> Add Address
        </button>
      </h3>

      {addressList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addressList.map((addr) => {
            const isSelected = selectedAddress?.id === addr.id
            return (
              <div
                key={addr.id}
                onClick={() => setSelectedAddress(addr)}
                className={`border rounded-xl p-4 cursor-pointer transition relative flex flex-col justify-between ${
                  isSelected
                    ? "border-primary bg-indigo-50/20 text-foreground"
                    : "border-border hover:border-border bg-card"
                }`}
              >
                <div>
                  <p className="font-semibold text-sm">{addr.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {addr.street}, {addr.city}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {addr.state}, {addr.zip} - {addr.country}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">
                    📞 {addr.phone}
                  </p>
                </div>
                {isSelected && (
                  <span className="absolute top-3 right-3 text-primary">
                    <CheckCircle2Icon size={18} />
                  </span>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-6 border border-dashed border-border rounded-xl bg-background">
          <p className="text-sm text-muted-foreground">
            No addresses saved. Add one to checkout.
          </p>
        </div>
      )}
    </div>
  )
}
