import Button from "@/components/ui/Button";
const DeleteAccount = () => {
  return (
    <div className="w-full  max-w-[612px] bg-[#334155] rounded-[6px]">
      <div className="p-[24px] flex flex-col gap-[1rem] max-[425px]:px-[10px]">
        <div>
          <h1 className="text-[24px]">Delete Account</h1>
          <p>
            Permanently delete your account and all of its contents from the
            Chirp platform. This action is not reversible, so please continue
            with caution.
          </p>
        </div>

        <div className="flex justify-end min-[1260px]:mt-[35px]">
          <Button
            icon=""
            text="Delete Account"
            className="btn-outline-danger rounded-[999px]"
          />
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;
