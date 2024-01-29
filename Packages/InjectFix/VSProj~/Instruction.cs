/*
 * Tencent is pleased to support the open source community by making InjectFix available.
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.  All rights reserved.
 * InjectFix is licensed under the MIT License, except for the third-party components listed in the file 'LICENSE' which may be subject to their corresponding license terms. 
 * This file is subject to the terms and conditions defined in file 'LICENSE', which is part of this source code package.
 */

namespace IFix.Core
{
    public enum Code
    {
        Conv_Ovf_U1_Un,
        Ldind_Ref,
        Conv_U8,
        Conv_Ovf_I4_Un,
        Ble_Un,
        Ldelem_U4,
        Conv_R_Un,
        Newarr,
        Ldc_I8,
        Add,
        Ldflda,
        Initobj,
        Stelem_Ref,
        Stind_I4,
        Stelem_I4,
        Bgt_Un,
        Ldobj,
        Ldelem_U2,
        Conv_Ovf_U_Un,
        Conv_Ovf_U1,
        Div,
        Conv_Ovf_I8,
        Conv_I,
        Stind_I1,
        Ble,
        Mul_Ovf,
        Ldind_R8,
        Mul,
        Blt,
        Ldelem_R8,
        Shr_Un,
        Pop,
        Stind_I,
        Div_Un,
        Rem,
        Conv_U2,
        Castclass,
        Ldelem_Ref,
        Conv_U4,
        Ldloca,
        Throw,
        Ldlen,
        Brfalse,
        Conv_I4,
        Rethrow,
        Ldsflda,
        Ldvirtftn2,
        Conv_I1,
        Nop,
        Ldelema,
        Stelem_R8,
        Conv_Ovf_U4_Un,
        Conv_Ovf_U4,
        Callvirtvirt,
        Ldfld,
        Add_Ovf,
        Stind_R8,
        Ret,
        Stsfld,
        Localloc,
        Break,
        Stelem_R4,
        Ldind_I4,
        Stfld,
        Callvirt,
        Stloc,
        Initblk,
        Ldsfld,
        Cgt_Un,
        Clt,
        Or,
        Ldelem_I2,
        Ldind_U1,
        Ldelem_I1,
        Sub_Ovf_Un,
        Ckfinite,
        Ldelem_R4,
        Stelem_I1,
        Ldc_R8,
        Bge_Un,
        Conv_Ovf_I_Un,
        Sub,
        Ldtype, // custom
        Stind_R4,
        Refanyval,
        Clt_Un,
        Ldtoken,
        Conv_Ovf_U8,
        Conv_Ovf_I1,
        Conv_Ovf_U,
        Unaligned,
        Unbox,
        Ldind_I8,
        Ldind_U4,
        Box,
        Cpobj,
        Switch,
        Call,
        Cgt,
        Conv_I8,
        Ldc_I4,
        Sizeof,
        Br,
        Ldarga,
        //Calli,
        Ldnull,
        Conv_Ovf_I2,
        Bne_Un,
        Conv_R8,
        Leave,
        Stelem_I8,
        Beq,
        Readonly,
        Jmp,
        Brtrue,
        Endfinally,
        Stind_I8,
        Volatile,
        Ldind_I,
        Mul_Ovf_Un,
        Mkrefany,
        Ldind_I1,
        Constrained,
        Stobj,
        Endfilter,
        Ldelem_Any,
        No,

        //Pseudo instruction
        StackSpace,
        Blt_Un,
        Ldelem_U1,
        Rem_Un,
        Cpblk,
        Conv_Ovf_U2,
        And,
        Conv_I2,
        Xor,
        Stelem_I,
        Shr,
        Ldstr,
        Ldind_R4,
        Ldftn,
        Stind_I2,
        Ldarg,
        Conv_Ovf_U2_Un,
        Stelem_Any,
        Isinst,
        Refanytype,
        Ldc_R4,
        Conv_R4,
        Not,
        Sub_Ovf,
        Ceq,
        Conv_Ovf_U8_Un,
        Conv_U,
        Bgt,
        Conv_Ovf_I2_Un,
        Tail,
        Dup,
        Newobj,
        Newanon,
        Shl,
        Ldind_U2,
        Conv_Ovf_I8_Un,
        Ldelem_I4,
        Conv_Ovf_I1_Un,
        Stelem_I2,
        Unbox_Any,
        Stind_Ref,
        Ldind_I2,
        Ldelem_I,
        Ldelem_I8,
        CallExtern,
        Conv_Ovf_I4,
        Ldloc,
        Neg,
        Ldvirtftn,
        Arglist,
        Bge,
        Add_Ovf_Un,
        Conv_U1,
        Conv_Ovf_I,
        Starg,
    }

    [System.Runtime.InteropServices.StructLayout(System.Runtime.InteropServices.LayoutKind.Sequential)]
    public struct Instruction
    {
        /// <summary>
        /// 指令MAGIC
        /// </summary>
        public const ulong INSTRUCTION_FORMAT_MAGIC = 2799324912470785993;

        /// <summary>
        /// 当前指令
        /// </summary>
        public Code Code;

        /// <summary>
        /// 操作数
        /// </summary>
        public int Operand;
    }

    public enum ExceptionHandlerType
    {
        Catch = 0,
        Filter = 1,
        Finally = 2,
        Fault = 4
    }

    public sealed class ExceptionHandler
    {
        public System.Type CatchType;
        public int CatchTypeId;
        public int HandlerEnd;
        public int HandlerStart;
        public ExceptionHandlerType HandlerType;
        public int TryEnd;
        public int TryStart;
    }
}