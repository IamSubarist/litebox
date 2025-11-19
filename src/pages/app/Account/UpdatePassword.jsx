import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";

const UpdatePassword = () => {
  return (
    <div className="w-full  max-w-[612px] bg-[#334155] rounded-[6px]">
      <div className="p-[24px] flex flex-col gap-[1rem] max-[425px]:px-[10px]">
        <div>
          <h1 className="text-[24px]">Update Password</h1>
          <p>Secure your account with a new password.</p>
        </div>

        <div className="w-full flex items-end gap-2 max-[425px]:flex-col">
          <Textinput
            label="Password"
            id="h_password"
            type="password"
            placeholder="Phone number"
            className="h-[40px] rounded-[6px] bg-black-500"
          />
          <Button
            text="Create New"
            className="w-[112px] h-[40px] btn-outline-light rounded-[999px] max-[425px]:w-full"
          />
        </div>

        <div className="flex justify-end">
          <Button
            icon="heroicons-outline:newspaper"
            text="Save Changes"
            className="bg-[#0F172A] rounded-[999px] hover:bg-[#0F172A]/80 "
          />
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
